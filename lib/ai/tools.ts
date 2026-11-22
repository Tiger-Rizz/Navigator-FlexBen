/**
 * Deterministic tools the AI calls (CLAUDE.md §11). Zod input schemas plus pure implementations that
 * use the engines and scheme data. The API route wraps these for the model; the scripted fallback
 * calls the same functions, so cards and numbers render identically.
 */
import { z } from 'zod';
import { employer, planYears, scenarioLibrary, scheme, SelectionSchema, type Selection } from '@/lib/data';
import { comparePlans } from '@/lib/engine/claims';
import { price, excessSaving } from '@/lib/engine/pricing';
import { formatAnnual, formatAnnualExact, formatMonthly } from '@/lib/engine/format';
import { checkEligibility, chooseScenarios, daysLeft } from '@/lib/engine/rules';
import { leverSummary, whoLabel } from '@/lib/plan';
import { buildProposal, schemeOptionsSummary } from './proposal';
import { ChangeSchema } from './types';
import type { ResolvedContext } from './context';

const SelectionInput = SelectionSchema.describe(
  'A full plan. tier: core|enhanced|premium; excess: 0|100|250|500; outpatient: 500|1000|"full"; specialist: guided|directory|extended; dependants: ids of people covered besides the member, e.g. ["sam"].',
);

export const toolSchemas = {
  get_member_context: z.object({}),
  get_scheme_options: z.object({}),
  price_plan: z.object({ selection: SelectionInput }),
  compare_plans: z.object({ selections: z.array(SelectionInput).min(1).max(4) }),
  propose_plan_change: z.object({
    title: z.string().max(60).describe('Short sentence-case title, e.g. "Add Sam, keep it lean"'),
    changes: z.array(ChangeSchema).min(1).max(6),
    rationale: z.string().max(300),
  }),
  run_scenarios: z.object({
    selections: z.array(SelectionInput).min(1).max(3),
    scenarioIds: z.array(z.string()).optional().describe('Omit to use the scenarios chosen for this member'),
  }),
  compare_plan_years: z.object({}),
  search_policy: z.object({ query: z.string() }),
  check_eligibility: z.object({
    relationship: z.enum(['spouse', 'civil_partner', 'cohabiting_partner', 'child', 'parent', 'other_relative']),
    age: z.number().int().min(0).max(120).optional(),
    inFullTimeEducation: z.boolean().optional(),
  }),
};

export const toolDescriptions: Record<keyof typeof toolSchemas, string> = {
  get_member_context: 'Facts about the member: age, postcode, tax rate, people on record, focus areas, current cover, the plan on screen, Flex Fund and the deadline.',
  get_scheme_options: 'The options Meridian offers with plain-English explanations, and the eligibility rules.',
  price_plan: 'The full price and tax breakdown for one plan. Use for every money figure.',
  compare_plans: 'Price breakdowns for several plans side by side.',
  propose_plan_change: 'Propose changes to the plan on screen. The app shows a card the member accepts or rejects; nothing changes until they accept.',
  run_scenarios: 'What the member would pay out of pocket in real situations on each plan, plus yearly totals.',
  compare_plan_years: 'What changed between the 2026–27 and 2027–28 schemes.',
  search_policy: 'Citable policy passages that match a query. Use to quote the rules.',
  check_eligibility: 'Whether someone can be covered, with the explanation.',
};

export function breakdownView(selection: Selection, ctx: ResolvedContext) {
  const b = price(selection, ctx.people, ctx.persona.taxRate);
  return {
    plan: `${leverSummary(selection)} · ${whoLabel(selection, ctx.people)}`,
    realMonthlyCost: formatMonthly(b.realMonthlyCost),
    premiumPerYear: formatAnnualExact(b.premium),
    paidByMeridian: formatAnnual(b.employerPays),
    fromFlexFund: formatAnnual(b.fromFund),
    unusedFlexFund: formatAnnual(b.unusedFund),
    fromPayPerMonth: formatMonthly(b.fromPayMonthly),
    incomeTaxPerMonth: formatMonthly(b.incomeTaxMonthly),
    taxableBenefitPerMonth: formatMonthly(b.taxableBenefitMonthly),
    realCostPerYear: formatAnnual(b.realAnnualCost),
  };
}

export function runTool(name: keyof typeof toolSchemas, input: unknown, ctx: ResolvedContext): unknown {
  const args = toolSchemas[name].parse(input) as never;
  switch (name) {
    case 'get_member_context': {
      const p = ctx.persona;
      return {
        name: p.name, age: p.age, postcode: `${p.postcode}, ${p.area}`, taxRate: `${Math.round(p.taxRate * 100)}%`, band: p.band,
        focusAreas: p.focusAreas,
        peopleOnRecord: ctx.people.map((d) => ({ id: d.id, name: d.name, relationship: d.relationship, source: d.source, covered: ctx.selection.dependants.includes(d.id) })),
        coverToday: breakdownView(p.currentSelection, ctx),
        planOnScreen: { selection: ctx.selection, ...breakdownView(ctx.selection, ctx) },
        flexFund: formatAnnual(employer.flexFund),
        enrolmentCloses: '31 March 2027', daysLeft: daysLeft(employer.demoToday), coverStarts: '1 April 2027',
        mentionedInChat: ctx.mentions,
      };
    }
    case 'get_scheme_options':
      return { options: schemeOptionsSummary(), rules: scheme.rules };
    case 'price_plan': {
      const { selection } = args as { selection: Selection };
      const out: Record<string, unknown> = breakdownView(selection, ctx);
      if (selection.excess > 0) {
        const s = excessSaving(selection, ctx.people, ctx.persona.taxRate);
        out.excessSaving = { perYear: formatAnnual(s.annual), perMonth: formatMonthly(s.monthly), paysOffIfYouClaimLessThanOnceEveryMonths: Math.floor(s.breakEvenMonths) };
      }
      return out;
    }
    case 'compare_plans':
      return (args as { selections: Selection[] }).selections.map((s) => breakdownView(s, ctx));
    case 'propose_plan_change': {
      const a = args as z.infer<typeof toolSchemas.propose_plan_change>;
      return buildProposal({ from: ctx.selection, changes: a.changes, people: ctx.people, taxRate: ctx.persona.taxRate, title: a.title, rationale: a.rationale });
    }
    case 'run_scenarios': {
      const a = args as { selections: Selection[]; scenarioIds?: string[] };
      const all = scenarioLibrary.scenarios;
      const scenarios = a.scenarioIds?.length
        ? all.filter((s) => a.scenarioIds!.includes(s.id))
        : chooseScenarios(all, ctx.persona.focusAreas, ctx.mentions, ctx.people.map((p) => p.id));
      const rows = comparePlans(a.selections.map((s, i) => ({ id: `plan${i + 1}`, selection: s })), scenarios, ctx.people, ctx.persona.taxRate);
      return rows.map((r) => ({
        plan: `${leverSummary(r.selection)} · ${whoLabel(r.selection, ctx.people)}`,
        realMonthlyCost: formatMonthly(r.realMonthlyCost),
        scenarios: r.results.map((x) => ({ id: x.scenarioId, title: scenarios.find((s) => s.id === x.scenarioId)!.title, youPay: formatAnnual(x.memberPays), note: x.note })),
        ifNothingHappens: formatAnnual(r.totals.coverCost),
        ifAllHappenedInOneYear: formatAnnual(r.totals.allInOneYear),
      }));
    }
    case 'compare_plan_years':
      return planYears;
    case 'search_policy': {
      const words = (args as { query: string }).query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const scored = scheme.policyText
        .map((p) => ({ p, score: words.filter((w) => (p.title + ' ' + p.text).toLowerCase().includes(w)).length }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((x) => x.p);
      return { passages: scored };
    }
    case 'check_eligibility': {
      const a = args as z.infer<typeof toolSchemas.check_eligibility>;
      const existing = ctx.people.filter((p) => p.relationship !== 'child');
      return checkEligibility({ ...a, existing });
    }
  }
}
