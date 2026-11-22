import { formatAnnual, formatMonthly } from '@/lib/engine/format';

/** Flex Fund used, with the "as cash" note. */
export function FundBar({ used, total, fundAsCashMonthly, unused }: { used: number; total: number; fundAsCashMonthly: number; unused: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-[13px]">
        <span className="text-secondary">Flex Fund used</span>
        <span className="font-medium">{formatAnnual(used)} of {formatAnnual(total)}</span>
      </div>
      <div className="h-2 rounded bg-brand-tint" role="img" aria-label={`${pct}% of your Flex Fund used`}>
        <div className="h-2 rounded bg-fund" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-secondary-2">
        {used > 0
          ? `Spending your Flex Fund here means about ${formatMonthly(fundAsCashMonthly)} a month less if you’d taken it as cash.`
          : `${formatAnnual(unused)} of your Flex Fund is free for other benefits, or to take as cash.`}
      </p>
    </div>
  );
}
