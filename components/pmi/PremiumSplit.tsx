import type { Breakdown } from '@/lib/engine/pricing';
import { formatAnnual } from '@/lib/engine/format';

/** Who pays the premium: Meridian, the Flex Fund and your pay, as one bar with a legend. */
export function PremiumSplit({ b, label }: { b: Breakdown; label?: string }) {
  const pct = (n: number) => `${b.premium > 0 ? (n / b.premium) * 100 : 0}%`;
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-[13px] text-secondary">{label}</span>}
      <div className="flex h-2 overflow-hidden rounded-full" role="img" aria-label={`Meridian ${formatAnnual(b.employerPays)}, Flex Fund ${formatAnnual(b.fromFund)}, your pay ${formatAnnual(b.fromPay)} a year`}>
        <div className="bg-fund" style={{ width: pct(b.employerPays) }} />
        <div className="bg-fund-soft" style={{ width: pct(b.fromFund) }} />
        <div className="bg-ink" style={{ width: pct(b.fromPay) }} />
      </div>
      <ul aria-hidden className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-secondary">
        <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-fund" />Meridian {formatAnnual(b.employerPays)}</li>
        <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-fund-soft" />Flex Fund {formatAnnual(b.fromFund)}</li>
        <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-ink" />Your pay {formatAnnual(b.fromPay)}</li>
      </ul>
    </div>
  );
}
