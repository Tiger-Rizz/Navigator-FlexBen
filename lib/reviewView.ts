/** Copy for the review and confirmed screens, built from the selection and the engine. Pure. */
import type { Dependant, Selection } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { changedLevers, coveredPeople, firstName, LEVERS, optionFor } from '@/lib/plan';

export function addedPeople(base: Selection, s: Selection, people: Dependant[]) {
  return coveredPeople(s, people).filter((p) => !base.dependants.includes(p.id));
}

/** "Sam", "Sam and Asha" */
export function nameList(ps: { name: string }[]) {
  const n = ps.map(firstName);
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

export function coveredHeadline(s: Selection, people: Dependant[]) {
  const others = coveredPeople(s, people);
  return others.length ? `You and ${nameList(others)} are covered from 1 April` : 'You’re covered from 1 April';
}

const SPECIALIST_PHRASE = { guided: 'specialists guided by AXA', directory: 'your choice of specialist', extended: 'your choice of specialist with Extended cover' } as const;

export function confirmedSummary(s: Selection, people: Dependant[], taxRate: number) {
  const b = price(s, people, taxRate);
  const outpatient = s.outpatient === 1000 ? '' : `, ${optionFor('outpatient', s.outpatient).summary}`;
  return `AXA Health ${optionFor('tier', s.tier).label}, ${optionFor('excess', s.excess).summary}, ${SPECIALIST_PHRASE[s.specialist]}${outpatient}. It costs you ${formatMonthly(b.realMonthlyCost)} a month, including tax. A summary is on its way to your inbox.`;
}

export function stayingTheSame(base: Selection, s: Selection) {
  const changed = changedLevers(base, s);
  const same = LEVERS.filter((l) => !changed.includes(l)).map((l) => {
    const o = optionFor(l, s[l]);
    if (l === 'tier') return `${o.label} cover level`;
    if (l === 'excess') return `the ${o.summary}`;
    if (l === 'outpatient') return s.outpatient === 'full' ? 'outpatient care paid in full' : `the ${o.summary}`;
    return o.summary;
  });
  if (!same.length) return 'MRI, CT and PET scans stay paid in full.';
  const list = same.length === 1 ? same[0] : `${same.slice(0, -1).join(', ')} and ${same[same.length - 1]}`;
  return `Staying the same: ${list}. MRI, CT and PET scans stay paid in full.`;
}

export interface Warning { kind: 'undo' | 'excess' | 'fund' | 'guided'; title: string; text: string }

export function beforeYouConfirm(base: Selection, s: Selection, people: Dependant[], taxRate: number): Warning[] {
  const b = price(s, people, taxRate);
  const added = addedPeople(base, s, people);
  const out: Warning[] = [];
  out.push({
    kind: 'undo',
    title: 'Hard to undo.',
    text: 'After 31 March you can only change this after another life event.' +
      (added.length ? ` Under Meridian’s scheme rules, if ${nameList(added)} ${added.length > 1 ? 'leave' : 'leaves'} and ${added.length > 1 ? 'rejoin' : 'rejoins'} later, ${added.length > 1 ? 'their' : 'his'} medical history may no longer be ignored.` : ''),
  });
  if (s.excess > 0) out.push({ kind: 'excess', title: 'The excess.', text: `You’ll pay the first ${formatAnnual(s.excess)} of claims, once per person each year you claim.` });
  if (b.fromFund > 0) {
    out.push({
      kind: 'fund',
      title: 'Your Flex Fund.',
      text: b.unusedFund <= 0
        ? `All ${formatAnnual(b.fromFund)} goes on health cover, so none is left for other benefits or to take as cash (about ${formatMonthly(b.fundAsCashMonthly)} a month after tax).`
        : `${formatAnnual(b.fromFund)} of your ${formatAnnual(b.flexFund)} goes on health cover. ${formatAnnual(b.unusedFund)} is left for other benefits or to take as cash.`,
    });
  }
  if (s.specialist === 'guided') out.push({ kind: 'guided', title: 'Guided by AXA.', text: 'When you need a specialist, AXA arranges one from its shortlist, so you can’t ask for a named consultant.' });
  return out;
}
