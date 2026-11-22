/**
 * Guided tour A: Priya adds Sam (CLAUDE.md §12). Every action is idempotent so Back and Next are safe,
 * and the AI is always scripted during the tour, so it is fully deterministic.
 */
import { scenarioLibrary } from '@/lib/data';
import { sameSelection } from '@/lib/plan';
import { sendMessage } from '@/lib/ai/client';
import { CANONICAL_OPENING, COMMON_QUESTIONS } from '@/lib/ai/questions';
import { memberPays } from '@/lib/engine/claims';
import { monthlyDifference, price } from '@/lib/engine/pricing';
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
const LEAN = scenarioLibrary.plans.find((p) => p.id === 'lean')!.selection;
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
    what: () => 'One small prompt: Navigator spots that Sam is on Priya’s HR record but not on her health cover.',
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
      return `Asking about the benefit gets an answer with Priya’s own numbers: a knee operation would cost her ${formatAnnual(memberPays(knee, state().selection, people()).memberPays)} on her current choices.`;
    },
    why: 'Answers come from the pricing engine, link to the benefit features and cite their sources.',
  },
  {
    route: '/benefits/pmi/cover',
    target: '[data-tour="fine-tune"]',
    enter: () => state().setAskOpen(false),
    what: () => {
      const s = state().selection;
      const save = -monthlyDifference(s, { ...s, excess: 250 }, people(), persona.taxRate);
      return `With that answer, Priya can decide for herself. Every option shows its effect on her monthly cost (a £250 excess would save ${formatMonthly(save)} a month), and what she gets updates alongside.`;
    },
    why: 'Informed choices, not guesses. If she’d rather talk it through, “Help me choose” is one tap away.',
  },
  {
    route: '/benefits/pmi/chat',
    target: '[data-tour="member-context"]',
    enter: () => state().setAskOpen(false),
    what: () => 'Or she taps “Help me choose”: the plan builder starts from what Navigator already knows.',
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
    route: '/benefits/pmi/scenarios',
    target: '[data-tour="scenario-grid"]',
    what: () => {
      const m = scenarioModel(persona, people(), state().selection, state().mentions, true);
      const row = (id: string) => m.rows.find((r) => r.planId === id)!;
      const more = Math.round(row('enhanced').totals.allInOneYear) - Math.round(row('lean').totals.allInOneYear);
      return `Before choosing, Priya compares plans on real situations: today’s cover, her choices so far, the lean suggestion and Enhanced. Even if ${m.countWord} happened, Enhanced would cost ${formatAnnual(more)} more than lean.`;
    },
    why: 'She chooses by consequences, not by premium alone. From here she can continue with a plan, or go back to fine-tune her cover herself.',
  },
  {
    route: '/benefits/pmi/review',
    target: '[data-tour="payslip"]',
    enter: () => {
      const s = state();
      if (s.status !== 'editing') s.unconfirm();
      if (!sameSelection(s.selection, LEAN)) s.applySelection(LEAN);
    },
    what: () => `Priya picks the lean plan at ${formatMonthly(money())} a month. Review shows her April 2027 payslip, now that tax on health cover is collected through payroll.`,
    why: 'No surprises after confirming: the deduction and the tax appear as they will on her payslip, with what’s hard to undo spelled out.',
  },
  {
    route: '/benefits/pmi/review',
    target: '[data-tour="confirmed"]',
    enter: () => {
      const s = state();
      if (!sameSelection(s.selection, LEAN)) s.applySelection(LEAN);
      if (!s.dobs[SAM]) s.setDob(SAM, '1991-07-14');
      s.setReviewAgreed(true);
      if (s.status !== 'confirmed') s.confirm();
    },
    what: () => `Sam’s date of birth is the only detail to add. Confirmed at ${formatMonthly(money())} a month: Navigator updates AXA and payroll, with no AXA login.`,
    why: 'Done in one place, in a few minutes. Finish returns Priya to her Private Medical Insurance page, now confirmed.',
  },
];
