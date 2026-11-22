/** Part 2 data (PART2.md §3–4) and its arithmetic. Pure; the pages and tests use these. */
import { z } from 'zod';
import payJson from '@/data/pay.april-2027.json';
import claimsJson from '@/data/claims.json';
import { roundTo } from '@/lib/engine/format';

const PayRow = z.object({
  id: z.string(), title: z.string(), sub: z.string(), takeHome: z.number(), grossMonthly: z.number().optional(),
  explain: z.string(), source: z.string(),
  link: z.object({ label: z.string(), href: z.string(), tile: z.string(), tileBg: z.string(), tileFg: z.string() }),
});
export const PaySchema = z.object({
  period: z.string(),
  summary: z.object({ lead: z.string(), strong: z.string(), rest: z.string(), source: z.string() }),
  payRiseBeforeTax: z.number(),
  takeHomeChange: z.number(),
  rates: z.object({ incomeTax: z.number(), nationalInsurance: z.number() }),
  rows: z.array(PayRow).length(4),
  defaultOpen: z.string(),
  lines: z.array(z.object({ label: z.string(), march: z.string(), april: z.string() })),
  questions: z.array(z.object({ q: z.string(), a: z.string() })),
  flag: z.object({ lines: z.array(z.object({ value: z.string(), label: z.string() })), sent: z.string() }),
  march: z.string(),
});
export type Pay = z.infer<typeof PaySchema>;

const Receipt = z.object({
  route: z.enum(['allowance', 'axa']), shop: z.string(), address: z.string(), date: z.string(), dateShort: z.string(),
  item: z.string(), what: z.string(), amount: z.number(), fileName: z.string(), sampleLine: z.string(), sampleRoute: z.string(),
  axa: z.object({ membership: z.string(), patient: z.string(), treatment: z.string(), checkIn: z.string() }).optional(),
});
export const ClaimsSchema = z.object({
  allowance: z.object({ name: z.string(), short: z.string(), annual: z.number(), rulesSource: z.string(), paidWithSalary: z.string() }),
  taxRate: z.number(),
  nationalInsurance: z.number(),
  recent: z.array(z.object({ what: z.string(), amount: z.number(), status: z.string() })),
  receipts: z.object({ glasses: Receipt, physio: Receipt }),
});
export type Claims = z.infer<typeof ClaimsSchema>;
export type ReceiptId = keyof Claims['receipts'];

export const pay: Pay = PaySchema.parse(payJson);
export const claims: Claims = ClaimsSchema.parse(claimsJson);

// ---- Pay arithmetic ----
/** Sum of the four take-home effects: +104.40 − 48.33 − 21.50 − 5.22 = +29.35. */
export const takeHomeTotal = (rows = pay.rows) => roundTo(rows.reduce((s, r) => s + r.takeHome, 0), 2);
/** What a gross monthly change is worth after income tax and NI (salary and salary sacrifice). */
export const afterTaxAndNi = (gross: number, rates = pay.rates) => roundTo(gross * (1 - rates.incomeTax - rates.nationalInsurance), 2);

// ---- Claim arithmetic ----
export const allowanceLeft = (annual: number, claimed: { amount: number }[]) => roundTo(annual - claimed.reduce((s, c) => s + c.amount, 0), 2);
/** Allowance payments are taxed like salary: 189 × (1 − 0.40 − 0.02) = 109.62. */
export const inPocketAfterTax = (amount: number, taxRate = claims.taxRate, ni = claims.nationalInsurance) => roundTo(amount * (1 - taxRate - ni), 2);

/** What AXA pays on an invoice, given the excess still to pay this year. */
export function axaOutcome(amount: number, excess: number) {
  const towardsExcess = Math.min(amount, excess);
  return { axaPays: roundTo(amount - towardsExcess, 2), towardsExcess, excessLeft: excess - towardsExcess };
}

export const money = (n: number) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const signedMoney = (n: number) => (n >= 0 ? '+' : '−') + money(Math.abs(n));
