/** Display rounding only (CLAUDE.md §7). Half-up, robust to binary float error. */
export function roundTo(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round((n + Math.sign(n) * 1e-9) * f) / f;
}

/** Monthly amounts: £51.50 */
export function formatMonthly(n: number): string {
  const v = roundTo(n, 2);
  return (v < 0 ? '−£' : '£') + Math.abs(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Annual amounts: £1,458 */
export function formatAnnual(n: number): string {
  const v = roundTo(n, 0);
  return (v < 0 ? '−£' : '£') + Math.abs(v).toLocaleString('en-GB', { maximumFractionDigits: 0 });
}

/** Annual amounts that may have pence, such as a £2,227.50 premium. Whole pounds when there are none. */
export function formatAnnualExact(n: number): string {
  const v = roundTo(n, 2);
  return Number.isInteger(v) ? formatAnnual(v) : formatMonthly(v);
}

export const perMonth = (n: number) => `${formatMonthly(n)} a month`;
export const perYear = (n: number) => `${formatAnnual(n)} a year`;
