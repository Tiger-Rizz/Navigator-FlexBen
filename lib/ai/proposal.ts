/** Builds a plan proposal from a list of changes. Prices come from the engine; nothing is applied. */
import { scheme, type Dependant, type Selection } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { checkEligibility, relationshipLabel } from '@/lib/engine/rules';
import { firstName, optionFor } from '@/lib/plan';
import type { Change, Proposal, ProposalLine } from './types';

const ORDER: Record<string, unknown[]> = {
  tier: ['core', 'enhanced', 'premium'],
  excess: [0, 100, 250, 500],
  outpatient: [500, 1000, 'full'],
  specialist: ['guided', 'directory', 'extended'],
};

export class ProposalError extends Error {}

export function applyChanges(from: Selection, changes: Change[], people: Dependant[]): Selection {
  const next: Selection = { ...from, dependants: [...from.dependants] };
  for (const c of changes) {
    if (c.field === 'add_dependant' || c.field === 'remove_dependant') {
      const person = people.find((p) => p.id === c.value);
      if (!person) throw new ProposalError(`No one called "${c.value}" is on record.`);
      if (c.field === 'add_dependant') {
        const others = people.filter((p) => p.id !== person.id && next.dependants.includes(p.id));
        const e = checkEligibility({ relationship: person.relationship, existing: others });
        if (!e.eligible) throw new ProposalError(e.explanation);
        if (!next.dependants.includes(person.id)) next.dependants.push(person.id);
      } else {
        next.dependants = next.dependants.filter((d) => d !== person.id);
      }
    } else {
      optionFor(c.field, c.value as never); // throws if the scheme doesn't offer it
      (next as Record<string, unknown>)[c.field] = c.value;
    }
  }
  return next;
}

function line(c: Change, from: Selection, people: Dependant[]): ProposalLine {
  if (c.field === 'add_dependant' || c.field === 'remove_dependant') {
    const p = people.find((x) => x.id === c.value)!;
    const rel = relationshipLabel(p.relationship);
    return c.field === 'add_dependant'
      ? { icon: '+', text: `Add ${firstName(p)} as your ${rel}` }
      : { icon: '−', text: `Remove ${firstName(p)} from your cover` };
  }
  const order = ORDER[c.field];
  const icon = order.indexOf(c.value) > order.indexOf(from[c.field]) ? '↗' : '↘';
  const fromLabel = optionFor(c.field, from[c.field] as never).label;
  const toLabel = optionFor(c.field, c.value as never).label;
  const name: Record<string, string> = { tier: 'Cover level', excess: 'Excess', outpatient: 'Outpatient allowance', specialist: 'Specialist choice' };
  const q = (s: string) => (c.field === 'specialist' ? `“${s}”` : s);
  let text = `${name[c.field]} from ${q(fromLabel)} to ${q(toLabel)}`;
  if (c.field === 'specialist' && c.value === 'guided') text += ', where AXA arranges your specialist';
  return { icon, text };
}

export const TAX_NOTE =
  'Why the tax doesn’t change: it’s based on what Meridian and your Flex Fund pay, which stays the same. Every pound trimmed from the premium comes straight off your payslip deduction.';

let counter = 0;

export function buildProposal(args: {
  from: Selection;
  changes: Change[];
  people: Dependant[];
  taxRate: number;
  title?: string;
  rationale?: string;
  id?: string;
}): Proposal {
  const { from, changes, people, taxRate } = args;
  if (changes.length === 0) throw new ProposalError('A proposal needs at least one change.');
  const selection = applyChanges(from, changes, people);
  const proposed = price(selection, people, taxRate);

  const whoChanges = changes.filter((c) => c.field === 'add_dependant' || c.field === 'remove_dependant');
  const leverChanges = changes.filter((c) => c.field !== "add_dependant" && c.field !== "remove_dependant");
  let alternative: Proposal['alternative'] = null;
  if (whoChanges.length && leverChanges.length) {
    const alt = applyChanges(from, whoChanges, people);
    const added = whoChanges.filter((c) => c.field === 'add_dependant').map((c) => firstName(people.find((p) => p.id === c.value)!));
    alternative = {
      label: added.length ? `if you just add ${added.join(' and ')}` : 'with only the people changes',
      monthly: price(alt, people, taxRate).realMonthlyCost,
      selection: alt,
    };
  } else if (leverChanges.length) {
    alternative = { label: 'if you keep things as they are', monthly: price(from, people, taxRate).realMonthlyCost, selection: from };
  }

  let taxNote: string | null = null;
  if (alternative) {
    const altTax = price(alternative.selection, people, taxRate).incomeTax;
    if (Math.abs(altTax - proposed.incomeTax) < 0.005 && proposed.realMonthlyCost < alternative.monthly) taxNote = TAX_NOTE;
  }

  return {
    id: args.id ?? `p${Date.now().toString(36)}${(counter++).toString(36)}`,
    title: args.title ?? 'Suggested changes',
    rationale: args.rationale ?? '',
    lines: changes.map((c) => line(c, from, people)),
    from,
    selection,
    monthly: proposed.realMonthlyCost,
    alternative,
    taxNote,
  };
}

/** The canonical "Add Sam, keep it lean" proposal (CLAUDE.md §11). */
export function leanAddProposal(from: Selection, people: Dependant[], taxRate: number, partnerId: string, id?: string) {
  const changes: Change[] = [{ field: 'add_dependant', value: partnerId }];
  if (from.excess !== 250) changes.push({ field: 'excess', value: 250 });
  if (from.specialist !== 'guided') changes.push({ field: 'specialist', value: 'guided' });
  const name = firstName(people.find((p) => p.id === partnerId)!);
  return buildProposal({
    from, changes, people, taxRate, id,
    title: `Add ${name}, keep it lean`,
    rationale: `The lowest-cost sensible way to add ${name}: a £250 excess and Guided by AXA.`,
  });
}

export const schemeOptionsSummary = () => ({
  tier: scheme.options.tier.map(({ value, label, hint }) => ({ value, label, hint })),
  excess: scheme.options.excess.map(({ value, label, hint }) => ({ value, label, hint })),
  outpatient: scheme.options.outpatient.map(({ value, label, hint }) => ({ value, label, hint })),
  specialist: scheme.options.specialist.map(({ value, label, hint }) => ({ value, label, hint })),
});
