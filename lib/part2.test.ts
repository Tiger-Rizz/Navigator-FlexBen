import { describe, expect, it } from 'vitest';
import { getPersona, scenarioLibrary } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { afterTaxAndNi, allowanceLeft, axaOutcome, claims, inPocketAfterTax, money, pay, signedMoney, takeHomeTotal, waterfall } from './part2';
import { roundTo } from '@/lib/engine/format';

describe('Your pay, explained (PART2.md §3)', () => {
  it('the four changes add up to +£29.35: +104.40 − 48.33 − 21.50 − 5.22', () => {
    expect(pay.rows.map((r) => r.takeHome)).toEqual([104.4, -48.33, -21.5, -5.22]);
    expect(takeHomeTotal()).toBe(29.35);
    expect(takeHomeTotal()).toBe(pay.takeHomeChange);
    expect(signedMoney(takeHomeTotal())).toBe('+£29.35');
  });
  it('salary and salary sacrifice lose 40% tax and 2% NI', () => {
    expect(afterTaxAndNi(180)).toBe(104.4);
    expect(afterTaxAndNi(-83.33)).toBe(-48.33);
    expect(afterTaxAndNi(-9)).toBe(-5.22);
  });
  it('the health cover effect matches the Part 1 engine: £16.67 more tax plus the £4.83 deduction', () => {
    const priya = getPersona('priya');
    const lean = scenarioLibrary.plans.find((p) => p.id === 'lean')!.selection;
    const before = price(priya.currentSelection, priya.peopleOnRecord, priya.taxRate);
    const after = price(lean, priya.peopleOnRecord, priya.taxRate);
    const effect = -(after.incomeTaxMonthly - before.incomeTaxMonthly + after.fromPayMonthly);
    expect(Math.round(effect * 100) / 100).toBe(-21.5);
    expect(pay.rows.find((r) => r.id === 'health')!.takeHome).toBe(-21.5);
    expect(money(after.taxableBenefitMonthly)).toBe('£116.67');
  });
  it('each line’s maths adds up to its take-home effect', () => {
    for (const r of pay.rows) expect(roundTo(r.maths.reduce((t, m) => t + m.amount, 0), 2)).toBe(r.takeHome);
  });
  it('the maths steps use the real rates: 40% tax, 2% NI', () => {
    const step = (id: string, i: number) => pay.rows.find((r) => r.id === id)!.maths[i].amount;
    expect(step('rise', 1)).toBe(-180 * 0.4);
    expect(step('rise', 2)).toBe(roundTo(-180 * 0.02, 2));
    expect(step('cycle', 1)).toBe(roundTo(83.33 * 0.42, 2));
    expect(step('pension', 1)).toBe(roundTo(9 * 0.42, 2));
    expect(step('health', 1)).toBe(-roundTo(116.67 * 0.4, 2));
    expect(step('health', 2)).toBe(roundTo((900 / 12) * 0.4, 2));
  });
  it('the waterfall runs 0 → 104.40 → 56.07 → 34.57 → 29.35', () => {
    expect(waterfall().map((w) => w.to)).toEqual([104.4, 56.07, 34.57, 29.35]);
    expect(waterfall().at(-1)!.to).toBe(pay.takeHomeChange);
  });
  it('the old tax code 1167L is 1257L less the £900 benefit', () => {
    expect(`${(12570 - 900) / 10}L`).toBe('1167L');
  });
});

describe('Claim it (PART2.md §4)', () => {
  it('allowance left this year: 500 − 45 − 25 = 430', () => {
    expect(allowanceLeft(claims.allowance.annual, claims.recent)).toBe(430);
  });
  it('after the glasses: 430 − 189 = 241', () => {
    expect(allowanceLeft(claims.allowance.annual, [...claims.recent, { amount: claims.receipts.glasses.amount }])).toBe(241);
  });
  it('in your pocket after tax: 189 × 0.58 = 109.62', () => {
    expect(inPocketAfterTax(189)).toBe(109.62);
  });
  it('physio with a £250 excess: AXA pays nothing and £65 counts towards the excess', () => {
    expect(axaOutcome(65, 250)).toEqual({ axaPays: 0, towardsExcess: 65, excessLeft: 185 });
  });
  it('physio with no excess: AXA pays it all', () => {
    expect(axaOutcome(65, 0)).toEqual({ axaPays: 65, towardsExcess: 0, excessLeft: 0 });
  });
});
