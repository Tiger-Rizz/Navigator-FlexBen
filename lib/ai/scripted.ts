/**
 * Scripted fallback (CLAUDE.md §11). Used when there's no API key, when the live call fails, and
 * always during the guided tour. Deterministic: intent matching on the suggested questions and tour
 * steps, with the same tools run locally so cards and numbers match the live path.
 */
import { scenarioLibrary, type Selection } from '@/lib/data';
import { memberPays } from '@/lib/engine/claims';
import { excessSaving, monthlyDifference, price } from '@/lib/engine/pricing';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { firstName } from '@/lib/plan';
import { buildProposal, leanAddProposal } from './proposal';
import { BUILDER_CHIPS, COMMON_QUESTIONS } from './questions';
import type { ResolvedContext } from './context';
import type { MessagePart, StreamEvent } from './types';

const SOURCES = 'Meridian scheme rules, AXA 2027–28 policy document, your current choices';
const t = (text: string): StreamEvent => ({ type: 'text', delta: text });
const part = (p: Exclude<MessagePart, { type: 'text' }>): StreamEvent => ({ type: 'part', part: p });
const sources = (s = SOURCES) => part({ type: 'sources', items: [s] });

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

function partnerOnRecord(ctx: ResolvedContext) {
  return ctx.persona.peopleOnRecord.find((p) => p.relationship !== 'child');
}

function scenario(id: string) {
  return scenarioLibrary.scenarios.find((s) => s.id === id)!;
}

function kneeCard(sel: Selection, ctx: ResolvedContext) {
  const s = scenario('knee');
  const pays = memberPays(s, sel, ctx.people).memberPays;
  const outpatient = s.costs.outpatient ?? 0;
  const allow = sel.outpatient === 'full' ? Infinity : sel.outpatient;
  const excess = sel.excess ? `${formatAnnual(sel.excess)} excess` : 'No excess';
  const rest =
    sel.outpatient === 'full'
      ? '. Outpatient costs paid in full.'
      : outpatient > allow
        ? `, plus ${formatAnnual(outpatient - allow)} over your ${formatAnnual(allow)} outpatient allowance.`
        : '. Outpatient costs fit within your allowance.';
  return part({ type: 'scenario', card: { label: 'You’d pay', amount: pays, note: excess + rest } });
}

// ---- Intents ----

function canonicalOpening(ctx: ResolvedContext): StreamEvent[] {
  const partner = partnerOnRecord(ctx);
  if (!partner) return generic();
  const name = firstName(partner);
  const ev: StreamEvent[] = [
    t(`Enrolment is open until 31 March, so you can add ${name} now. And good news on the asthma: under Meridian’s scheme rules, anyone added at enrolment joins with their medical history ignored, so it won’t be excluded. Worth knowing: PMI covers flare-ups and diagnosis, not routine ongoing care. That stays with his GP.`),
    part({ type: 'privacy' }),
  ];
  if (ctx.selection.dependants.includes(partner.id) && ctx.selection.excess === 250 && ctx.selection.specialist === 'guided') {
    ev.push(t(`${name} is already on your plan the lean way, at ${formatMonthly(price(ctx.selection, ctx.people, ctx.persona.taxRate).realMonthlyCost)} a month.`));
    return ev;
  }
  const from = { ...ctx.selection, dependants: ctx.selection.dependants.filter((d) => d !== partner.id) };
  ev.push(t(`Here’s the lowest-cost sensible way to add ${name}. I’ve put it on your plan so you can check it:`));
  ev.push(part({ type: 'proposal', proposal: leanAddProposal(from, ctx.people, ctx.persona.taxRate, partner.id, 'lean-add') }));
  return ev;
}

function canIAdd(ctx: ResolvedContext): StreamEvent[] {
  const partner = partnerOnRecord(ctx);
  if (!partner) return generic();
  const name = firstName(partner);
  if (ctx.selection.dependants.includes(partner.id)) {
    return [t(`${name}’s already in your choices. He’ll be covered from 1 April once you confirm. I’ll need his date of birth when you review.`), sources()];
  }
  const diff = monthlyDifference(ctx.selection, { ...ctx.selection, dependants: [...ctx.selection.dependants, partner.id] }, ctx.people, ctx.persona.taxRate);
  return [
    t(`Yes. Enrolment is open until 31 March, and it’s the main time in the year to add family. With your other choices as they are, that’s about ${formatMonthly(diff)} more a month, including tax.`),
    part({ type: 'actions', items: [{ label: `Add ${name} to my choices`, action: 'add_sam' }] }),
    sources(),
  ];
}

function knee(ctx: ResolvedContext): StreamEvent[] {
  return [
    t('Say you need two consultations and some tests (about £1,300), then an MRI and day-case surgery. The MRI and the surgery are paid in full on any of your options. You’d usually start with physio through AXA’s Muscles, Bones and Joints service, with no GP referral needed.'),
    kneeCard(ctx.selection, ctx),
    part({ type: 'links', items: ['Physiotherapy and osteopathy', 'MRI, CT and PET scans'] }),
    sources(),
  ];
}

function whatsChanged(): StreamEvent[] {
  return [
    t('Two things. Mental health outpatient cover goes up from £750 to £1,000 a year on every level, and there’s a new Guided by AXA option that lowers the cost if you let AXA arrange your specialist. Physio and your Core premium are unchanged.'),
    part({ type: 'links', items: ['Mental health support'] }),
    sources('Compared by Navigator from AXA’s 2026–27 and 2027–28 scheme documents for Meridian'),
  ];
}

function changeMind(): StreamEvent[] {
  return [
    t('After 31 March you can only change your cover after another life event, such as a birth, within 30 days of it. Under Meridian’s scheme rules, someone who leaves and rejoins later may no longer have their medical history ignored.'),
    sources(),
  ];
}

function preExisting(): StreamEvent[] {
  return [
    t('Yes, for you and anyone you add at enrolment: Meridian’s scheme ignores medical history. PMI covers flare-ups and diagnosis; routine management of long-term conditions stays with your GP.'),
    part({ type: 'privacy' }),
    sources(),
  ];
}

function compareEnhanced(ctx: ResolvedContext): StreamEvent[] {
  const partner = partnerOnRecord(ctx);
  const from = ctx.selection;
  const changes = [
    ...(from.tier !== 'enhanced' ? [{ field: 'tier' as const, value: 'enhanced' as const }] : []),
    ...(from.outpatient !== 'full' ? [{ field: 'outpatient' as const, value: 'full' as const }] : []),
    ...(from.specialist !== 'directory' ? [{ field: 'specialist' as const, value: 'directory' as const }] : []),
    ...(partner && !from.dependants.includes(partner.id) ? [{ field: 'add_dependant' as const, value: partner.id }] : []),
  ];
  if (!changes.length) return [t('You’re already on Enhanced with outpatient care paid in full.'), sources()];
  const p = buildProposal({ from, changes, people: ctx.people, taxRate: ctx.persona.taxRate, title: 'Enhanced, paid in full', id: 'enhanced', rationale: 'Outpatient care paid in full and a free choice of specialist.' });
  const diffYear = (p.monthly - price(from, ctx.people, ctx.persona.taxRate).realMonthlyCost) * 12;
  return [
    t(`Enhanced pays outpatient care in full, raises physio to 15 sessions and mental health to £2,000, and lets you choose your specialist. It costs ${formatMonthly(p.monthly)} a month, about ${formatAnnual(diffYear)} a year more than the plan on screen. The scenarios show whether that’s worth it for you.`),
    part({ type: 'proposal', proposal: p }),
  ];
}

function baby(ctx: ResolvedContext): StreamEvent[] {
  const kid = { id: '__baby', name: 'Baby', relationship: 'child' as const, source: 'added_by_member' as const };
  const people = [...ctx.people, kid];
  const diff = monthlyDifference(ctx.selection, { ...ctx.selection, dependants: [...ctx.selection.dependants, kid.id] }, people, ctx.persona.taxRate);
  return [
    t(`A birth is a qualifying life event, so you could add your baby within 30 days of the birth, without waiting for next year’s enrolment. On the plan on screen, a child would add about ${formatMonthly(diff)} a month, including tax. Children are covered at 40% of the adult rate.`),
    sources(),
  ];
}

function excessExplainer(ctx: ResolvedContext): StreamEvent[] {
  const sel = ctx.selection.excess > 0 ? ctx.selection : { ...ctx.selection, excess: 250 as const };
  const s = excessSaving(sel, ctx.people, ctx.persona.taxRate);
  return [
    t(`The excess is the first part of a claim you pay yourself, once per person each year, and it counts towards your outpatient allowance. A ${formatAnnual(sel.excess)} excess saves you about ${formatMonthly(s.monthly)} a month here, so it pays off if you claim less than about once every ${Math.floor(s.breakEvenMonths)} months.`),
    sources(),
  ];
}

function parents(): StreamEvent[] {
  return [
    t('Meridian’s scheme covers partners and children only, so parents and other relatives can’t be added. They could buy their own policy, but it would ask about their medical history and may exclude existing conditions. The Employee assistance programme in Navigator can talk through other support.'),
    sources(),
  ];
}

function looksRight(ctx: ResolvedContext): StreamEvent[] {
  const partner = partnerOnRecord(ctx);
  return [
    t(partner && !ctx.selection.dependants.includes(partner.id)
      ? `Thanks. What would you like to sort out? Most people either keep their cover or add family. ${firstName(partner)} isn’t on your cover today, if that’s on your mind.`
      : 'Thanks. What would you like to sort out?'),
    part({ type: 'chips', items: [`Add ${partner ? firstName(partner) : 'my partner'} without it costing a fortune`, ...BUILDER_CHIPS.slice(0, 2)] }),
  ];
}

function somethingChanged(): StreamEvent[] {
  return [
    t('Tell me what’s changed and I’ll update what I use for this conversation. Anything about your health stays between you and Navigator.'),
    part({ type: 'privacy' }),
  ];
}

export function generic(): StreamEvent[] {
  return [
    t('I can help with your private medical insurance: who’s covered, your excess and other options, and what real situations would cost you. Try one of these:'),
    part({ type: 'chips', items: [COMMON_QUESTIONS[0], COMMON_QUESTIONS[1], 'Compare with Enhanced'] }),
  ];
}

export function limitReached(): StreamEvent[] {
  return [t('You’ve reached the limit for this demo conversation. The questions below still work.'), part({ type: 'chips', items: [...COMMON_QUESTIONS.slice(0, 3)] })];
}

/** Deterministic reply for a message. */
export function scriptedReply(text: string, ctx: ResolvedContext): StreamEvent[] {
  const q = norm(text);
  if (/asthma/.test(q) || (/\bsam\b/.test(q) && /(fortune|cheap|lean|without it costing|keep it)/.test(q))) return canonicalOpening(ctx);
  if (/without it costing a fortune/.test(q)) return canonicalOpening(ctx);
  if (/^can i add\b/.test(q) || /\badd (sam|my (husband|wife|partner|spouse))\b/.test(q)) return canIAdd(ctx);
  if (/\bknee\b/.test(q)) return knee(ctx);
  if (/(what's changed|whats changed|what has changed).*(year)|since last year/.test(q)) return whatsChanged();
  if (/change my mind|change it later|after 31 march/.test(q)) return changeMind();
  if (/pre existing|existing condition/.test(q)) return preExisting();
  if (/enhanced/.test(q)) return compareEnhanced(ctx);
  if (/\bbaby\b|have a child|newborn/.test(q)) return baby(ctx);
  if (/\bexcess\b/.test(q)) return excessExplainer(ctx);
  if (/\b(parent|parents|mum|dad|mother|father)\b/.test(q)) return parents();
  if (/^looks right/.test(q)) return looksRight(ctx);
  if (/something's changed|somethings changed/.test(q)) return somethingChanged();
  return generic();
}

/** Streams events with a short typewriter effect. */
export async function* paced(events: StreamEvent[], msPerWord = 18): AsyncGenerator<StreamEvent> {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (const ev of events) {
    if (ev.type === 'text' && msPerWord > 0) {
      const words = ev.delta.match(/\S+\s*/g) ?? [ev.delta];
      for (const w of words) {
        yield { type: 'text', delta: w };
        await wait(msPerWord);
      }
    } else {
      yield ev;
      if (msPerWord > 0) await wait(msPerWord * 4);
    }
  }
}
