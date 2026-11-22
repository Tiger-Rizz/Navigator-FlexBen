/**
 * Pricing and tax engine (CLAUDE.md §7).
 * Pure functions. The UI and the AI tools both call this; nothing else computes money.
 * All amounts are unrounded annual pounds unless the name says Monthly. Round only in format.ts.
 */
import { employer, scheme, type Dependant, type Selection, type Tier, type Excess, type Outpatient, type Specialist } from '@/lib/data';

export interface PricingConfig {
  adultRates: Record<Tier, number>;
  childFactor: number;
  excessFactor: Record<string, number>;
  outpatientFactor: Record<string, number>;
  specialistFactor: Record<string, number>;
  employerCap: number;
  flexFund: number;
  partnerRelationships: string[];
}

const factors = <V extends string | number>(opts: { value: V; factor: number }[]) =>
  Object.fromEntries(opts.map((o) => [String(o.value), o.factor]));

export const defaultPricingConfig: PricingConfig = {
  adultRates: scheme.rates.adult,
  childFactor: scheme.rates.childFactor,
  excessFactor: factors(scheme.options.excess),
  outpatientFactor: factors(scheme.options.outpatient),
  specialistFactor: factors(scheme.options.specialist),
  employerCap: employer.employerContribution.annualCap,
  flexFund: employer.flexFund,
  partnerRelationships: scheme.rules.partnerRelationships,
};

export interface Breakdown {
  partnersCovered: number;
  childrenCovered: number;
  heads: number;
  loading: number;
  premium: number;          // P, annual
  employerPays: number;     // annual
  flexFund: number;         // fund available, incl. any downgrade saving
  fromFund: number;         // annual
  fromPay: number;          // annual, deducted from net pay
  unusedFund: number;
  taxableBenefit: number;   // annual
  incomeTax: number;        // annual
  realAnnualCost: number;   // fromPay + incomeTax
  realMonthlyCost: number;
  fromPayMonthly: number;
  incomeTaxMonthly: number;
  taxableBenefitMonthly: number;
  fundAsCashMonthly: number; // what using the fund "costs" vs taking it as cash
}

/** Count covered partners and children from the selection's dependant ids. */
export function countCovered(selection: Selection, people: Dependant[], cfg: PricingConfig = defaultPricingConfig) {
  let partners = 0;
  let children = 0;
  for (const id of selection.dependants) {
    const person = people.find((p) => p.id === id);
    if (!person) throw new Error(`Selection covers unknown dependant: ${id}`);
    if (cfg.partnerRelationships.includes(person.relationship)) partners += 1;
    else if (person.relationship === 'child') children += 1;
  }
  return { partners, children };
}

export function loadingFor(excess: Excess, outpatient: Outpatient, specialist: Specialist, cfg: PricingConfig = defaultPricingConfig) {
  const e = cfg.excessFactor[String(excess)];
  const o = cfg.outpatientFactor[String(outpatient)];
  const s = cfg.specialistFactor[String(specialist)];
  if (e === undefined || o === undefined || s === undefined) throw new Error('Option not offered by the scheme');
  return e * o * s;
}

export function price(
  selection: Selection,
  people: Dependant[],
  taxRate: number,
  cfg: PricingConfig = defaultPricingConfig,
): Breakdown {
  const { partners, children } = countCovered(selection, people, cfg);
  const adultRate = cfg.adultRates[selection.tier];
  const heads = adultRate * (1 + partners) + adultRate * cfg.childFactor * children;
  const loading = loadingFor(selection.excess, selection.outpatient, selection.specialist, cfg);
  const premium = heads * loading;

  const employerPays = Math.min(premium, cfg.employerCap);
  const flexFund = cfg.flexFund + (cfg.employerCap - employerPays); // downgrade savings return to the fund
  const fromFund = Math.min(premium - employerPays, flexFund);
  const fromPay = premium - employerPays - fromFund;
  const unusedFund = flexFund - fromFund;
  const taxableBenefit = premium - fromPay; // member contributions reduce the taxable value
  const incomeTax = taxableBenefit * taxRate;
  const realAnnualCost = fromPay + incomeTax;

  return {
    partnersCovered: partners,
    childrenCovered: children,
    heads,
    loading,
    premium,
    employerPays,
    flexFund,
    fromFund,
    fromPay,
    unusedFund,
    taxableBenefit,
    incomeTax,
    realAnnualCost,
    realMonthlyCost: realAnnualCost / 12,
    fromPayMonthly: fromPay / 12,
    incomeTaxMonthly: incomeTax / 12,
    taxableBenefitMonthly: taxableBenefit / 12,
    fundAsCashMonthly: (fromFund * (1 - taxRate)) / 12,
  };
}

/** Difference in real monthly cost between two selections (b − a). Used for "Add · £X a month". */
export function monthlyDifference(a: Selection, b: Selection, people: Dependant[], taxRate: number, cfg = defaultPricingConfig) {
  return price(b, people, taxRate, cfg).realMonthlyCost - price(a, people, taxRate, cfg).realMonthlyCost;
}

/** Annual premium saving from choosing `excess` instead of £0, all else equal. */
export function excessSaving(selection: Selection, people: Dependant[], taxRate: number, cfg = defaultPricingConfig) {
  const withExcess = price(selection, people, taxRate, cfg);
  const noExcess = price({ ...selection, excess: 0 }, people, taxRate, cfg);
  const annual = noExcess.realAnnualCost - withExcess.realAnnualCost;
  const breakEvenMonths = annual > 0 ? (selection.excess / annual) * 12 : Infinity;
  return { annual, monthly: annual / 12, premiumDifference: noExcess.premium - withExcess.premium, breakEvenMonths };
}
