import { describe, expect, it } from 'vitest';
import { scenarioLibrary } from '@/lib/data';
import { comparePlans, displayedDifference, memberPays, yearTotals } from './claims';
import { price } from './pricing';
import { formatAnnual } from './format';
import { enhanced, keep, lean, people, priya } from './fixtures';

const rate = priya.taxRate;
const scen = (id: string) => {
  const s = scenarioLibrary.scenarios.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s;
};
const plans = { keep, lean, enhanced };
type PlanId = keyof typeof plans;

// CLAUDE.md §8 scenario table
const table: { id: string; expected: Record<PlanId, string> }[] = [
  { id: 'knee', expected: { keep: '£300', lean: '£550', enhanced: '£250' } },
  { id: 'sam-asthma', expected: { keep: '£650', lean: '£250', enhanced: '£250' } },
  { id: 'therapy', expected: { keep: '£0', lean: '£250', enhanced: '£250' } },
  { id: 'back-physio', expected: { keep: '£240', lean: '£490', enhanced: '£250' } },
];

describe('claims engine: §8 scenario cells', () => {
  for (const row of table) {
    for (const planId of Object.keys(plans) as PlanId[]) {
      it(`${row.id} on ${planId} → ${row.expected[planId]}`, () => {
        const r = memberPays(scen(row.id), plans[planId], people);
        expect(formatAnnual(r.memberPays)).toBe(row.expected[planId]);
      });
    }
  }

  it('Sam not covered on today’s plan pays the full private cost, with the note', () => {
    const r = memberPays(scen('sam-asthma'), keep, people);
    expect(r.covered).toBe(false);
    expect(r.memberPays).toBe(650);
    expect(r.note).toBe('Sam isn’t covered: pay privately or wait for the NHS');
  });

  it('scans and day-case surgery are paid in full (knee on full outpatient is excess only)', () => {
    const r = memberPays(scen('knee'), enhanced, people);
    expect(r.totalCost).toBe(11300);
    expect(r.beyondLimits).toBe(0);
    expect(r.excessPart).toBe(250);
  });

  it('the member never pays more than the journey costs', () => {
    const tiny = { ...scen('therapy'), costs: { mentalHealth: 100 } };
    expect(memberPays(tiny, lean, people).memberPays).toBe(100);
  });
});

// CLAUDE.md §8 totals rows
describe('claims engine: §8 totals rows', () => {
  const all = scenarioLibrary.scenarios;
  const nothing: Record<PlanId, string> = { keep: '£360', lean: '£618', enhanced: '£1,388' };
  const allFour: Record<PlanId, string> = { keep: '£1,550', lean: '£1,658', enhanced: '£1,888' };

  for (const planId of Object.keys(plans) as PlanId[]) {
    const t = yearTotals(all, plans[planId], people, rate);
    it(`if nothing happens on ${planId} → ${nothing[planId]}`, () => expect(formatAnnual(t.coverCost)).toBe(nothing[planId]));
    it(`if all four happened on ${planId} → ${allFour[planId]} (excess once per person)`, () =>
      expect(formatAnnual(t.allInOneYear)).toBe(allFour[planId]));
  }

  it('lean, all four: Priya’s excess is charged once, Sam’s once', () => {
    const t = yearTotals(all, lean, people, rate);
    // Priya: £250 excess + £300 over outpatient + £240 physio; Sam: £250 excess
    expect(t.claimsIfAll).toBe(1040);
  });

  it('comparePlans returns monthly costs £30.00 / £51.50 / £115.63', () => {
    const rows = comparePlans(scenarioLibrary.plans, all, people, rate);
    expect(rows.map((r) => r.planId)).toEqual(['keep', 'lean', 'enhanced']);
    expect(rows.map((r) => r.realMonthlyCost.toFixed(3))).toEqual(['30.000', '51.500', '115.625']);
  });
});

describe('headlines the AI states (§8)', () => {
  const all = scenarioLibrary.scenarios;
  it('adding Sam the lean way costs £258 a year more than today', () => {
    const diff = displayedDifference(price(keep, people, rate).realAnnualCost, price(lean, people, rate).realAnnualCost);
    expect(diff).toBe(258);
  });
  it('even if all four happened, Enhanced would still cost £230 more than lean', () => {
    const l = yearTotals(all, lean, people, rate).allInOneYear;
    const e = yearTotals(all, enhanced, people, rate).allInOneYear;
    expect(displayedDifference(l, e)).toBe(230);
  });
});
