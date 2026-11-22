'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { FundBar } from '@/components/pmi/FundBar';
import { employer } from '@/lib/data';
import { formatAnnual, formatAnnualExact, formatMonthly, perMonth } from '@/lib/engine/format';
import { daysLeft } from '@/lib/engine/rules';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { countChanges, planChips } from '@/lib/plan';
import { baseline, usePlan } from '@/lib/store';
import { CoveredPeople } from './CoveredPeople';

/** "+£21.50 a month on today", or "Same as today". */
const diffLabel = (d: number) => (Math.abs(d) < 0.005 ? 'Same as today' : `${d > 0 ? '+' : '−'}${formatMonthly(Math.abs(d))} a month on today`);

export function StatusChip() {
  const { selection, status } = usePlan();
  const n = countChanges(baseline, selection);
  if (status === 'kept' || status === 'confirmed') return <Badge tone="success">Confirmed</Badge>;
  if (n === 0) return <Badge>No changes</Badge>;
  return <Badge tone="ai">{n} {n === 1 ? 'change' : 'changes'} to confirm</Badge>;
}

/**
 * "Your cover from 1 April". `summary` is the compact card on the benefit page (button: Adjust your cover);
 * the full panel sits on the cover page (Review and confirm, Reset).
 */
export function CoverPanel({ variant = 'full' }: { variant?: 'full' | 'summary' }) {
  const { selection, reset, status } = usePlan();
  const b = usePlanPricing(selection);
  const now = usePlanPricing(baseline);
  const summary = variant === 'summary';

  const rows: [string, string][] = [
    ['Total premium', `${formatAnnualExact(b.premium)} a year`],
    ['Paid by Meridian', formatAnnual(b.employerPays)],
    ['From your Flex Fund', formatAnnual(b.fromFund)],
    ['From your pay', perMonth(b.fromPayMonthly)],
    ['Income tax on the benefit', perMonth(b.incomeTaxMonthly)],
  ];

  return (
    <aside aria-labelledby="cover-panel" data-tour={summary ? undefined : 'cover-panel'} className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cover-panel" className="text-base">Your cover from 1 April</h2>
        <StatusChip />
      </div>
      <div className="flex flex-col gap-0.5" aria-live="polite">
        <span className="text-[13px] text-secondary">What it really costs you</span>
        <span className="text-[32px] font-semibold leading-tight tracking-tight">
          {formatMonthly(b.realMonthlyCost)} <span className="text-[15px] font-normal text-secondary">a month</span>
        </span>
        {summary ? (
          <span className="text-xs text-secondary-2">{diffLabel(b.realMonthlyCost - now.realMonthlyCost)}</span>
        ) : (
          <span className="text-xs text-secondary-2">Keeping your current cover: {perMonth(now.realMonthlyCost)}</span>
        )}
      </div>
      {summary ? (
        <>
          <div className="flex flex-col gap-3 border-t border-divider pt-4">
            <CoveredPeople selection={selection} />
            <ul aria-label="Your choices" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {planChips(selection).map((c) => <li key={c} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-2">{c}</li>)}
            </ul>
          </div>
          {status === 'editing' && <p className="text-xs font-medium text-warning">Closes 31 March: {daysLeft(employer.demoToday)} days left</p>}
          <Link href="/benefits/pmi/cover" className={buttonClass('secondary', 'w-full')}>Adjust your cover</Link>
        </>
      ) : (
        <>
          {[rows.slice(0, 3), rows.slice(3)].map((group, gi) => (
            <dl key={gi} className="m-0 flex flex-col gap-2 border-t border-divider pt-3 text-[13px]">
              {group.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-secondary">{k}</dt>
                  <dd className="m-0 whitespace-nowrap font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          ))}
          <FundBar used={b.fromFund} total={b.flexFund} fundAsCashMonthly={b.fundAsCashMonthly} unused={b.unusedFund} />
          <p className="text-xs font-medium text-warning">Closes 31 March: {daysLeft(employer.demoToday)} days left</p>
          <Link href="/benefits/pmi/review" className={buttonClass('primary', 'w-full')}>Review and confirm</Link>
          <button type="button" onClick={reset} className="-my-1 min-h-11 text-sm font-medium text-secondary underline-offset-2 hover:underline cursor-pointer">
            Reset to my current cover
          </button>
        </>
      )}
    </aside>
  );
}
