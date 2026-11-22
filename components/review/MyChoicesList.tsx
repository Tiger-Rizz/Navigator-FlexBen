'use client';

import Link from 'next/link';
import { buttonClass } from '@/components/ui/Button';
import { AxaTile } from '@/components/pmi/BenefitHeader';
import { formatMonthly } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { leverSummary, whoLabel } from '@/lib/plan';
import { usePeople, usePlan } from '@/lib/store';

export function MyChoicesList() {
  const people = usePeople();
  const { confirmedSelection, selection } = usePlan();
  const s = confirmedSelection ?? selection;
  const b = usePlanPricing(s);
  if (!confirmedSelection) {
    return (
      <div className="flex max-w-[560px] flex-col items-start gap-3 rounded-[16px] border border-line px-6 py-[22px]">
        <h2 className="text-lg">No confirmed choices yet</h2>
        <p className="text-secondary">Enrolment for 2027–28 is open until 31 March. Your choices appear here once you confirm them.</p>
        <Link href="/benefits/pmi" className={buttonClass('primary')}>Review my health cover</Link>
      </div>
    );
  }
  return (
    <ul className="m-0 flex max-w-[760px] list-none flex-col gap-3 p-0">
      <li className="flex flex-wrap items-center gap-4 rounded-[16px] border border-line px-6 py-5">
        <AxaTile size={40} />
        <div className="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span className="font-semibold">Private Medical Insurance</span>
          <span className="text-[13px] text-secondary">{leverSummary(s).replace(/^./, (c) => c.toUpperCase())}</span>
          <span className="text-[13px] text-secondary">{whoLabel(s, people)} · from 1 April 2027 · {formatMonthly(b.realMonthlyCost)} a month</span>
        </div>
        <Link href="/benefits/pmi" className={buttonClass('secondary')}>Change until 31 March</Link>
      </li>
    </ul>
  );
}
