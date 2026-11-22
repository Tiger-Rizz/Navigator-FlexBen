import { describe, expect, it } from 'vitest';
import { getPersona } from '@/lib/data';
import { formatMonthly } from '@/lib/engine/format';
import { resolveContext } from './context';
import { buildProposal, ProposalError, TAX_NOTE } from './proposal';
import { CANONICAL_OPENING, COMMON_QUESTIONS } from './questions';
import { scriptedReply } from './scripted';
import { runTool } from './tools';
import type { MessagePart, Proposal, StreamEvent } from './types';

const priya = getPersona('priya');
const ctx = (overrides: Partial<{ selection: typeof priya.currentSelection; mentions: string[] }> = {}) =>
  resolveContext({ personaId: 'priya', selection: overrides.selection ?? priya.currentSelection, addedPeople: [], mentions: overrides.mentions ?? [] });

const text = (ev: StreamEvent[]) => ev.filter((e) => e.type === 'text').map((e) => (e as { delta: string }).delta).join(' ');
const parts = (ev: StreamEvent[]) => ev.filter((e) => e.type === 'part').map((e) => (e as { part: MessagePart }).part);

describe('canonical opening exchange (§11)', () => {
  const ev = scriptedReply(CANONICAL_OPENING, ctx());
  const proposal = (parts(ev).find((p) => p.type === 'proposal') as { proposal: Proposal }).proposal;

  it('explains medical history is ignored and PMI covers flare-ups, not routine care', () => {
    expect(text(ev)).toContain('medical history ignored');
    expect(text(ev)).toContain('PMI covers flare-ups and diagnosis, not routine ongoing care');
  });
  it('includes the privacy note', () => expect(parts(ev).some((p) => p.type === 'privacy')).toBe(true));
  it('proposes "Add Sam, keep it lean" with three changes', () => {
    expect(proposal.title).toBe('Add Sam, keep it lean');
    expect(proposal.lines.map((l) => l.text)).toEqual([
      'Add Sam as your spouse',
      'Excess from £0 to £250',
      'Specialist choice from “Your choice” to “Guided by AXA”, where AXA arranges your specialist',
    ]);
    expect(proposal.lines.map((l) => l.icon)).toEqual(['+', '↗', '↘']);
  });
  it('costs £51.50 a month vs £80.00 if you just add Sam, with the tax note', () => {
    expect(formatMonthly(proposal.monthly)).toBe('£51.50');
    expect(formatMonthly(proposal.alternative!.monthly)).toBe('£80.00');
    expect(proposal.alternative!.label).toBe('if you just add Sam');
    expect(proposal.taxNote).toBe(TAX_NOTE);
  });
});

describe('scripted common questions use engine numbers', () => {
  it('Can I add Sam? → about £50.00 more a month, with an add action', () => {
    const ev = scriptedReply(COMMON_QUESTIONS[0], ctx());
    expect(text(ev)).toContain('about £50.00 more a month');
    expect(parts(ev).some((p) => p.type === 'actions')).toBe(true);
  });
  it('knee operation on current cover → card says £300', () => {
    const card = parts(scriptedReply(COMMON_QUESTIONS[1], ctx())).find((p) => p.type === 'scenario') as { card: { amount: number; note: string } };
    expect(card.card.amount).toBe(300);
    expect(card.card.note).toBe('No excess, plus £300 over your £1,000 outpatient allowance.');
  });
  it('knee operation on the lean plan → £550', () => {
    const lean = { ...priya.currentSelection, excess: 250 as const, specialist: 'guided' as const, dependants: ['sam'] };
    const card = parts(scriptedReply(COMMON_QUESTIONS[1], ctx({ selection: lean }))).find((p) => p.type === 'scenario') as { card: { amount: number } };
    expect(card.card.amount).toBe(550);
  });
  it('pre-existing conditions answer carries the privacy note', () => {
    expect(parts(scriptedReply(COMMON_QUESTIONS[4], ctx())).some((p) => p.type === 'privacy')).toBe(true);
  });
  it('every common question gets a specific (non-generic) answer', () => {
    for (const q of COMMON_QUESTIONS) expect(text(scriptedReply(q, ctx()))).not.toContain('Try one of these');
  });
  it('unknown free text gets the generic answer with chips', () => {
    const ev = scriptedReply('tell me a joke', ctx());
    expect(parts(ev).some((p) => p.type === 'chips')).toBe(true);
  });
  it('is deterministic', () => {
    expect(scriptedReply(CANONICAL_OPENING, ctx())).toEqual(scriptedReply(CANONICAL_OPENING, ctx()));
  });
});

describe('tools', () => {
  const lean = { tier: 'core', excess: 250, outpatient: 1000, specialist: 'guided', dependants: ['sam'] };
  it('price_plan returns engine figures', () => {
    const out = runTool('price_plan', { selection: lean }, ctx()) as Record<string, unknown>;
    expect(out.realMonthlyCost).toBe('£51.50');
    expect(out.premiumPerYear).toBe('£1,458');
    expect(out.incomeTaxPerMonth).toBe('£46.67');
    expect(out.excessSaving).toEqual({ perYear: '£162', perMonth: '£13.50', paysOffIfYouClaimLessThanOnceEveryMonths: 18 });
  });
  it('price_plan rejects options the scheme does not offer', () => {
    expect(() => runTool('price_plan', { selection: { ...lean, excess: 300 } }, ctx())).toThrow();
  });
  it('propose_plan_change refuses someone not on record', () => {
    expect(() => runTool('propose_plan_change', { title: 'x', rationale: 'y', changes: [{ field: 'add_dependant', value: 'mum' }] }, ctx())).toThrow(ProposalError);
  });
  it('run_scenarios reproduces the §8 lean column', () => {
    const [plan] = runTool('run_scenarios', { selections: [lean], scenarioIds: ['knee', 'sam-asthma', 'therapy', 'back-physio'] }, ctx()) as { scenarios: { youPay: string }[]; ifNothingHappens: string; ifAllHappenedInOneYear: string }[];
    expect(plan.scenarios.map((s) => s.youPay)).toEqual(['£550', '£250', '£250', '£490']);
    expect(plan.ifNothingHappens).toBe('£618');
    expect(plan.ifAllHappenedInOneYear).toBe('£1,658');
  });
  it('check_eligibility refuses parents', () => {
    expect((runTool('check_eligibility', { relationship: 'parent' }, ctx()) as { eligible: boolean }).eligible).toBe(false);
  });
  it('search_policy finds the chronic conditions passage', () => {
    const out = runTool('search_policy', { query: 'asthma flare-ups' }, ctx()) as { passages: { id: string }[] };
    expect(out.passages[0].id).toBe('chronic');
  });
  it('a lever-only proposal compares against keeping things as they are', () => {
    const p = buildProposal({ from: priya.currentSelection, changes: [{ field: 'tier', value: 'enhanced' }], people: priya.peopleOnRecord, taxRate: 0.4 });
    expect(p.alternative?.label).toBe('if you keep things as they are');
    expect(formatMonthly(p.alternative!.monthly)).toBe('£30.00');
  });
});
