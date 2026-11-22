import { describe, expect, it } from 'vitest';
import { price, excessSaving, monthlyDifference } from './pricing';
import { formatAnnual, formatAnnualExact, formatMonthly } from './format';
import { addSamOnly, current, currentPlusChild, enhanced, keep, lean, people, priya } from './fixtures';

const rate = priya.taxRate;

// CLAUDE.md §7 "Required test cases (Priya, 40%)"
const rows = [
  { name: 'Current: Core, just Priya, £0, £1,000, directory', sel: current, premium: '£900', premiumExact: 900, fromPay: '£0.00', tax: '£30.00', real: '£30.00' },
  { name: 'Add Sam only (Core, £0, £1,000, directory)', sel: addSamOnly, premium: '£1,800', premiumExact: 1800, fromPay: '£33.33', tax: '£46.67', real: '£80.00' },
  { name: 'Lean: Core, Priya + Sam, £250, £1,000, guided', sel: lean, premium: '£1,458', premiumExact: 1458, fromPay: '£4.83', tax: '£46.67', real: '£51.50' },
  { name: 'Enhanced, Priya + Sam, £250, full, directory', sel: enhanced, premium: '£2,227.50', premiumExact: 2227.5, fromPay: '£68.96', tax: '£46.67', real: '£115.63' },
  { name: 'Current + one child', sel: currentPlusChild, premium: '£1,260', premiumExact: 1260, fromPay: '£0.00', tax: '£42.00', real: '£42.00' },
];

describe('pricing engine: §7 table', () => {
  for (const r of rows) {
    describe(r.name, () => {
      const b = price(r.sel, people, rate);
      it(`premium is ${r.premium}`, () => {
        expect(b.premium).toBeCloseTo(r.premiumExact, 6);
        expect(formatAnnualExact(b.premium)).toBe(r.premium);
      });
      it(`from pay is ${r.fromPay} a month`, () => expect(formatMonthly(b.fromPayMonthly)).toBe(r.fromPay));
      it(`tax is ${r.tax} a month`, () => expect(formatMonthly(b.incomeTaxMonthly)).toBe(r.tax));
      it(`real cost is ${r.real} a month`, () => expect(formatMonthly(b.realMonthlyCost)).toBe(r.real));
      it('the parts add up to the premium', () => {
        expect(b.employerPays + b.fromFund + b.fromPay).toBeCloseTo(b.premium, 6);
      });
    });
  }

  it('the §8 “Keep as is” plan is Priya’s current selection', () => {
    expect(keep).toEqual(current);
  });
});

describe('pricing engine: breakdown details', () => {
  it('current cover: Meridian pays £900, the Flex Fund is untouched', () => {
    const b = price(current, people, rate);
    expect(b.employerPays).toBe(900);
    expect(b.fromFund).toBe(0);
    expect(b.unusedFund).toBe(500);
    expect(b.fundAsCashMonthly).toBe(0);
  });

  it('lean plan: £900 Meridian, £500 Flex Fund, £58 from pay, £1,400 taxable', () => {
    const b = price(lean, people, rate);
    expect(b.employerPays).toBe(900);
    expect(b.fromFund).toBe(500);
    expect(formatAnnual(b.fromPay)).toBe('£58');
    expect(b.unusedFund).toBe(0);
    expect(b.taxableBenefit).toBeCloseTo(1400, 6);
    expect(formatMonthly(b.taxableBenefitMonthly)).toBe('£116.67');
    expect(formatMonthly(b.fundAsCashMonthly)).toBe('£25.00');
  });

  it('payslip "now" column: £75.00 taxable benefit a month', () => {
    expect(formatMonthly(price(current, people, rate).taxableBenefitMonthly)).toBe('£75.00');
  });

  it('tax is the same (£46.67) for Sam-only and lean: every pound cut comes off the payslip deduction', () => {
    const samOnly = price(addSamOnly, people, rate);
    const l = price(lean, people, rate);
    expect(samOnly.incomeTax).toBeCloseTo(l.incomeTax, 6);
    expect(samOnly.fromPay - l.fromPay).toBeCloseTo(samOnly.premium - l.premium, 6);
  });

  it('"Add · £X a month" for Sam from current cover is £50.00', () => {
    expect(formatMonthly(monthlyDifference(current, addSamOnly, people, rate))).toBe('£50.00');
  });

  it('a downgrade below £900 returns the saving to the Flex Fund', () => {
    const cheap = { ...current, excess: 500 as const, specialist: 'guided' as const };
    const b = price(cheap, people, rate);
    expect(b.premium).toBeCloseTo(900 * 0.85 * 0.9, 6); // £688.50
    expect(b.employerPays).toBeCloseTo(688.5, 6);
    expect(b.flexFund).toBeCloseTo(500 + 211.5, 6);
    expect(b.fromPay).toBe(0);
  });

  it('rejects dependants who are not on record', () => {
    expect(() => price({ ...current, dependants: ['nobody'] }, people, rate)).toThrow();
  });
});

describe('excess saving on the lean plan', () => {
  const s = excessSaving(lean, people, rate);
  it('saves £162 a year versus £0 excess', () => {
    expect(s.annual).toBeCloseTo(162, 6);
    expect(s.premiumDifference).toBeCloseTo(162, 6);
    expect(formatAnnual(s.annual)).toBe('£162');
  });
  it('saves £13.50 a month', () => expect(formatMonthly(s.monthly)).toBe('£13.50'));
  it('pays off if you claim less than once every ~18 months', () => {
    expect(s.breakEvenMonths).toBeGreaterThan(18);
    expect(s.breakEvenMonths).toBeLessThan(19);
  });
});
