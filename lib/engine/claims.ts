/**
 * Claims engine (CLAUDE.md §7 "Claims engine" and §8).
 * What the member pays out of pocket for a scenario on a given selection. Pure functions.
 */
import { scheme, type Dependant, type Scenario, type Selection, type Scheme } from '@/lib/data';
import { price, type PricingConfig, defaultPricingConfig } from './pricing';
import { formatAnnual, roundTo } from './format';

export interface ClaimResult {
  scenarioId: string;
  who: string;
  covered: boolean;
  totalCost: number;   // full private cost of the journey
  excessPart: number;  // portion of memberPays that is the excess
  beyondLimits: number; // portion over allowances and limits
  memberPays: number;  // excessPart + beyondLimits (or totalCost when not covered)
  note: string;
}

type Limits = Scheme['limits'];

export function totalCostOf(scenario: Scenario, limits: Limits = scheme.limits): number {
  const c = scenario.costs;
  return (c.outpatient ?? 0) + (c.mentalHealth ?? 0) + (c.physioSessions ?? 0) * limits.physioSessionCost + (c.paidInFull ?? 0);
}

export function isCovered(who: string, selection: Selection): boolean {
  return who === 'member' || selection.dependants.includes(who);
}

function firstName(who: string, people: Dependant[]): string {
  const p = people.find((d) => d.id === who);
  return p ? p.name.split(' ')[0] : 'They';
}

export function memberPays(
  scenario: Scenario,
  selection: Selection,
  people: Dependant[] = [],
  limits: Limits = scheme.limits,
): ClaimResult {
  const totalCost = totalCostOf(scenario, limits);
  const base = { scenarioId: scenario.id, who: scenario.who, totalCost };

  if (!isCovered(scenario.who, selection)) {
    const name = firstName(scenario.who, people);
    return { ...base, covered: false, excessPart: 0, beyondLimits: totalCost, memberPays: totalCost,
      note: `${name} isn’t covered: pay privately or wait for the NHS` };
  }

  const c = scenario.costs;
  const tier = selection.tier;
  const parts: string[] = [];

  // Outpatient: the allowance includes the excess; 'full' means excess only.
  let outpatientOver = 0;
  if (c.outpatient) {
    const allowance = selection.outpatient === 'full' ? Infinity : selection.outpatient;
    outpatientOver = Math.max(0, c.outpatient - allowance);
    if (outpatientOver > 0) parts.push(`${formatAnnual(outpatientOver)} over the ${formatAnnual(allowance)} outpatient allowance`);
  }

  // Mental health outpatient: cost beyond the tier's limit.
  let mhOver = 0;
  if (c.mentalHealth) {
    const limit = limits.mentalHealthOutpatient[tier];
    mhOver = limit === null ? 0 : Math.max(0, c.mentalHealth - limit);
    if (mhOver > 0) parts.push(`${formatAnnual(mhOver)} over the ${formatAnnual(limit!)} mental health limit`);
  }

  // Physio: sessions beyond the tier limit at the session price.
  let physioOver = 0;
  if (c.physioSessions) {
    const limit = limits.physioSessions[tier];
    const extra = limit === null ? 0 : Math.max(0, c.physioSessions - limit);
    physioOver = extra * limits.physioSessionCost;
    if (extra > 0) parts.push(`${extra} session${extra === 1 ? '' : 's'} not covered`);
  }

  // Scans, inpatient and day-case are paid in full: nothing to add.
  const beyondLimits = outpatientOver + mhOver + physioOver;
  const excessPart = Math.min(selection.excess, totalCost - beyondLimits);
  const pays = excessPart + beyondLimits;

  let note: string;
  if (pays === 0) note = 'Fully covered, no excess';
  else if (excessPart > 0 && parts.length) note = `${formatAnnual(excessPart)} excess, plus ${parts.join(' and ')}`;
  else if (excessPart > 0) note = 'Just the excess';
  else note = parts.join(' and ').replace(/^./, (s) => s.toUpperCase());

  return { ...base, covered: true, excessPart, beyondLimits, memberPays: pays, note };
}

export interface YearTotals {
  coverCost: number;      // "If nothing happens": deductions + tax for the year
  claimsIfAll: number;    // out of pocket if every scenario happened, excess once per person
  allInOneYear: number;   // coverCost + claimsIfAll
}

/** Totals rows (§8): the excess is charged once per person when several claims happen in one year. */
export function yearTotals(
  scenarios: Scenario[],
  selection: Selection,
  people: Dependant[],
  taxRate: number,
  cfg: PricingConfig = defaultPricingConfig,
  limits: Limits = scheme.limits,
): YearTotals {
  const coverCost = price(selection, people, taxRate, cfg).realAnnualCost;
  const byPerson = new Map<string, ClaimResult[]>();
  for (const s of scenarios) {
    const r = memberPays(s, selection, people, limits);
    byPerson.set(s.who, [...(byPerson.get(s.who) ?? []), r]);
  }
  let claimsIfAll = 0;
  for (const results of byPerson.values()) {
    const maxExcess = Math.max(0, ...results.map((r) => r.excessPart));
    claimsIfAll += maxExcess + results.reduce((sum, r) => sum + r.beyondLimits, 0);
  }
  return { coverCost, claimsIfAll, allInOneYear: coverCost + claimsIfAll };
}

export interface PlanComparison {
  planId: string;
  selection: Selection;
  realMonthlyCost: number;
  results: ClaimResult[];
  totals: YearTotals;
}

export function comparePlans(
  plans: { id: string; selection: Selection }[],
  scenarios: Scenario[],
  people: Dependant[],
  taxRate: number,
): PlanComparison[] {
  return plans.map((p) => ({
    planId: p.id,
    selection: p.selection,
    realMonthlyCost: price(p.selection, people, taxRate).realMonthlyCost,
    results: scenarios.map((s) => memberPays(s, p.selection, people)),
    totals: yearTotals(scenarios, p.selection, people, taxRate),
  }));
}

/**
 * Differences between plans, worked out from the displayed (whole-pound) annual totals,
 * so the headline always agrees with the table (e.g. £1,888 − £1,658 = £230).
 */
export function displayedDifference(a: number, b: number): number {
  return roundTo(b, 0) - roundTo(a, 0);
}
