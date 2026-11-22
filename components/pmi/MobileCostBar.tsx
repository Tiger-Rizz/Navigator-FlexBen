'use client';

import { formatMonthly } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { usePlan } from '@/lib/store';
import { StatusChip } from './CoverPanel';

/** Narrow screens only: keeps the real monthly cost in view (CLAUDE.md §2.5). */
export function MobileCostBar() {
  const selection = usePlan((s) => s.selection);
  const b = usePlanPricing(selection);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-white px-4 py-2.5 lg:hidden">
      <div className="flex flex-1 flex-col">
        <span className="text-xs text-secondary">What it really costs you</span>
        <span className="text-lg font-semibold" aria-live="polite">{formatMonthly(b.realMonthlyCost)} <span className="text-[13px] font-normal text-secondary">a month</span></span>
      </div>
      <StatusChip />
      <a href="#cover-panel" className="inline-flex min-h-11 items-center rounded-[10px] bg-ink px-4 text-sm font-medium text-white no-underline">Details</a>
    </div>
  );
}
