/**
 * Guided tour A: Priya adds Sam (CLAUDE.md §12). Every action is idempotent so Back and Next are safe,
 * and the AI is always scripted during the tour, so it is fully deterministic.
 */
import { scenarioLibrary } from '@/lib/data';
import { acceptProposalWithFollowUp, sendMessage } from '@/lib/ai/client';
import { CANONICAL_OPENING, COMMON_QUESTIONS } from '@/lib/ai/questions';
import { memberPays } from '@/lib/engine/claims';
import { price } from '@/lib/engine/pricing';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { scenarioModel } from '@/lib/scenarioView';
import { baseline, usePlan } from '@/lib/store';
import { getPersona } from '@/lib/data';

export interface TourHelpers {
  go: (route: string) => Promise<void>;
  waitFor: (fn: () => boolean, timeoutMs?: number) => Promise<boolean>;
}

export interface TourStep {
  route: string;
  target: string;
  what: () => string;
  why: string;
  enter?: (h: TourHelpers) => Promise<void> | void;
}

const persona = getPersona('priya');
const SAM = 'sam';
const KNEE = COMMON_QUESTIONS[1];
const state = () => usePlan.getState();
const people = () => [...persona.peopleOnRecord, ...state().addedPeople];
const money = (sel = state().selection) => price(sel, people(), persona.taxRate).realMonthlyCost;
const userAsked = (q: string) => state().messages.some((m) => m.role === 'user' && m.parts[0]?.type === 'text' && m.parts[0].text === q);
const idle = (h: TourHelpers) => h.waitFor(() => !state().busy, 15000);

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/home',
    target: '[data-tour="home-nudge"]',
    what: () => 'Navigator spots a gap: Sam is on Priya’s HR record, but not on her health cover.',
    why: 'It asks about people already on record. It never guesses at life events.',
  },
  {
    route: '/benefits/pmi',
    target: '[data-tour="pmi-flex"]',
    what: () => 'On the PMI page, the old external “Manage benefit” link becomes a prompt and a live “Your cover” card.',
    why: 'Navigator says this is a flex benefit and what needs attention, with the real monthly cost in view.',
  },
  {
    route: '/benefits/pmi/cover',
    target: '[data-tour="quick-choices"]',
    what: () => '“Review my health cover” opens the flex page. Quick choices come first: keep your cover or add family, one tap each.',
    why: 'Easiest path first. Fine-tuning is there, but nobody has to touch it.',
  },
  {
    route: '/benefits/pmi/cover',
    target: '[data-tour="cover-panel"]',
    enter: () => state().cover(SAM),
    what: () => `Adding Sam updates the cost live: ${formatMonthly(money(baseline))} → ${formatMonthly(money({ ...baseline, dependants: [SAM] }))} a month, with the full breakdown.`,
    why: 'The real cost is the payroll deduction plus income tax, after Meridian’s contribution and the Flex Fund.',
  },
  {
    route: '/benefits/pmi/cover',
    target: '[data-tour="whats-changed"]',
    what: () => 'What’s changed since last year reuses the plan-year comparison GAP already holds.',
    why: 'Members see what’s different before they decide, with the source shown.',
  },
  {
    route: '/benefits/pmi/cover',
    target: '[data-tour="ask-panel"]',
    enter: async (h) => {
      if (!userAsked(KNEE)) state().openAsk(KNEE);
      else state().setAskOpen(true);
      await h.waitFor(() => userAsked(KNEE));
      await idle(h);
    },
    what: () => {
      const knee = scenarioLibrary.scenarios.find((s) => s.id === 'knee')!;
      return `Ask AI answers with Priya’s own numbers: a knee operation would cost her ${formatAnnual(memberPays(knee, state().selection, people()).memberPays)} on her current choices.`;
    },
    why: 'Answers come from the pricing engine, link to the benefit features and cite their sources.',
  },
  {
    route: '/benefits/pmi/chat',
    target: '[data-tour="member-context"]',
    enter: () => state().setAskOpen(false),
    what: () => '“Help me choose” opens the plan builder, starting from what Navigator already knows.',
    why: 'No form to fill in: Priya only corrects what’s wrong.',
  },
  {
    route: '/benefits/pmi/chat',
    target: '[data-tour="privacy"]',
    enter: async (h) => {
      state().setContextConfirmed(true);
      if (!userAsked(CANONICAL_OPENING)) await sendMessage(CANONICAL_OPENING);
      await idle(h);
    },
    what: () => 'Priya mentions Sam’s asthma. The AI explains he joins with his medical history ignored.',
    why: 'Health details stay between Priya and Navigator. Meridian never sees them.',
  },
  {
    route: '/benefits/pmi/chat',
    target: '[data-tour="proposal"]',
    what: () => {
      const p = state().proposal;
      return p?.alternative
        ? `The AI proposes a lean way to add Sam: ${formatMonthly(p.monthly)} a month, against ${formatMonthly(p.alternative.monthly)} if she just adds him.`
        : 'The AI proposes a lean way to add Sam.';
    },
    why: 'The tax stays the same, so every pound trimmed comes straight off the payslip deduction.',
  },
  {
    route: '/benefits/pmi/chat',
    target: '[data-tour="live-plan"]',
    enter: () => acceptProposalWithFollowUp(),
    what: () => `Priya accepts. The live plan updates to ${formatMonthly(money())} a month, and so does every other screen.`,
    why: 'Chat and screen are two views of the same plan: the AI proposes, the member decides.',
  },
  {
    route: '/benefits/pmi/scenarios',
    target: '[data-tour="scenario-summary"]',
    what: () => {
      const m = scenarioModel(persona, people(), state().selection, state().mentions);
      const [, mid, enh] = m.rows;
      const more = Math.round(enh.totals.allInOneYear) - Math.round(mid.totals.allInOneYear);
      return `Scenarios price real situations on each plan. Even if ${m.countWord} happened in one year, Enhanced would still cost ${formatAnnual(more)} more.`;
    },
    why: 'Priya can choose by consequences, not by premium alone.',
  },
  {
    route: '/benefits/pmi/review',
    target: '[data-tour="payslip"]',
    enter: () => { if (state().status === 'confirmed') state().unconfirm(); },
    what: () => 'Review shows the April 2027 payslip, now that tax on medical benefits is collected through payroll, and what’s hard to undo.',
    why: 'No surprises after confirming: the deduction and the tax appear as they will on the payslip.',
  },
  {
    route: '/benefits/pmi/review',
    target: '[data-tour="confirmed"]',
    enter: () => {
      const s = state();
      if (!s.dobs[SAM]) s.setDob(SAM, '1991-07-14');
      s.setReviewAgreed(true);
      if (s.status !== 'confirmed') s.confirm();
      window.scrollTo({ top: 0 });
    },
    what: () => `Sam’s date of birth is the only detail to add. Confirmed at ${formatMonthly(money())} a month: Navigator updates AXA and payroll, with no AXA login.`,
    why: 'Done in one place, in a few minutes, with nothing hard to undo left unsaid.',
  },
];
