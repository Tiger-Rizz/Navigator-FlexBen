'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { FundBar } from '@/components/pmi/FundBar';
import { employer } from '@/lib/data';
import { formatAnnual, formatAnnualExact, formatMonthly, perMonth } from '@/lib/engine/format';
import { daysLeft } from '@/lib/engine/rules';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { countChanges } from '@/lib/plan';
import { baseline, usePersona, usePlan } from '@/lib/store';

export function StatusChip() {
  const { selection, status } = usePlan();
  const n = countChanges(baseline, selection);
  if (status === 'kept' || status === 'confirmed') return <Badge tone="success">Confirmed</Badge>;
  if (n === 0) return <Badge>No changes</Badge>;
  return <Badge tone="ai">{n} {n === 1 ? 'change' : 'changes'} to confirm</Badge>;
}

export function CoverPanel() {
  const persona = usePersona();
  const { selection, reset } = usePlan();
  const b = usePlanPricing(selection);
  const now = usePlanPricing(baseline);
  const taxPct = Math.round(persona.taxRate * 100);

  const rows: [string, string][] = [
    ['Total premium', `${formatAnnualExact(b.premium)} a year`],
    ['Paid by Meridian', formatAnnual(b.employerPays)],
    ['From your Flex Fund', formatAnnual(b.fromFund)],
    ['From your pay', perMonth(b.fromPayMonthly)],
    ['Income tax on the benefit', perMonth(b.incomeTaxMonthly)],
  ];

  return (
    <aside aria-labelledby="cover-panel" data-tour="cover-panel" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex items-center justify-between gap-2">
        <h2 id="cover-panel" className="text-lg">Your cover from 1 April</h2>
        <StatusChip />
      </div>
      <div className="flex flex-col gap-0.5" aria-live="polite">
        <span className="text-[13px] text-secondary">What it really costs you</span>
        <span className="text-[32px] font-semibold tracking-tight">
          {formatMonthly(b.realMonthlyCost)} <span className="text-[15px] font-normal text-secondary">a month</span>
        </span>
        <span className="text-xs text-secondary-2">Keeping your current cover: {perMonth(now.realMonthlyCost)}</span>
      </div>
      <dl className="m-0 flex flex-col gap-2 border-t border-divider pt-3 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-secondary">{k}</dt>
            <dd className="m-0 font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <FundBar used={b.fromFund} total={b.flexFund} fundAsCashMonthly={b.fundAsCashMonthly} unused={b.unusedFund} />
      <p className="text-xs font-medium text-warning">Closes 31 March: {daysLeft(employer.demoToday)} days left</p>
      <Link href="/benefits/pmi/review" className={buttonClass('primary', 'w-full')}>Review and confirm</Link>
      <button type="button" onClick={reset} className="min-h-11 text-sm font-medium text-secondary underline-offset-2 hover:underline cursor-pointer">
        Reset to my current cover
      </button>
      <p className="text-xs text-secondary-2">
        Guidance, not financial advice. Illustrative prices. Tax shown at your {taxPct}% rate. No AXA login needed: we update AXA and payroll for you.
      </p>
    </aside>
  );
}
