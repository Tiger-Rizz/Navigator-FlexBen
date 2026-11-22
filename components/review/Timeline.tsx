'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';
import type { Dependant, Selection } from '@/lib/data';
import { formatMonthly } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { coveredPeople } from '@/lib/plan';
import { addedPeople, nameList } from '@/lib/reviewView';

interface Item { month: string; day: string; title: string; detail: string; key?: boolean; today?: boolean; done?: boolean }

/** What happens next, as calendar tiles on a line, so the dates read at a glance. */
export function Timeline({ base, selection, people, confirmed = false }: { base: Selection; selection: Selection; people: Dependant[]; confirmed?: boolean }) {
  const b = usePlanPricing(selection);
  const headingId = useId();
  // Inside the confirmation sheet the sheet's own headline is the only h2.
  const Heading = confirmed ? 'h3' : 'h2';
  const added = addedPeople(base, selection, people);
  const covered = coveredPeople(selection, people);
  const items: Item[] = [
    confirmed
      ? { month: 'Mar', day: '22', title: 'Confirmed today', detail: 'Summary on its way. We’re updating AXA and payroll.', today: true, done: true }
      : { month: 'Mar', day: '22', title: 'You confirm', detail: 'Summary by email. We update AXA and payroll.', today: true },
    ...(added.length ? [{ month: 'Mar', day: '25', title: `${nameList(added)} set up with AXA`, detail: 'App invite sent' }] : []),
    { month: 'Apr', day: '1', title: 'Cover starts', detail: covered.length ? `For you and ${nameList(covered)}` : 'Your cover continues', key: true },
    { month: 'Apr', day: '30', title: 'First payslip', detail: `${formatMonthly(b.realMonthlyCost)} a month, including tax` },
  ];
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-5 py-5">
      <Heading id={headingId} className="text-base font-semibold">{confirmed ? 'What happens now' : 'What happens next'}</Heading>
      <ol className="relative m-0 flex list-none flex-col gap-4 p-0">
        <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-px bg-line" />
        {items.map((it) => (
          <li key={`${it.month}${it.day}`} className="relative flex items-center gap-3.5">
            <span
              aria-hidden
              className={`flex w-[44px] shrink-0 flex-col overflow-hidden rounded-[9px] border text-center ${it.key ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`}
            >
              <span className={`py-0.5 text-[10px] font-semibold uppercase tracking-wide ${it.key ? 'bg-black/15' : it.today ? 'bg-ai-bg text-ai-text' : 'bg-brand-tint text-brand'}`}>{it.month}</span>
              <span className="py-0.5 text-base font-semibold leading-tight">{it.day}</span>
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {it.done && <span aria-hidden className="flex size-4 items-center justify-center rounded-full bg-success text-white"><Check size={10} strokeWidth={3} /></span>}
                {it.title}<span className="sr-only">, {it.day} {it.month === 'Mar' ? 'March' : 'April'}</span>
              </span>
              <span className="text-xs text-secondary">{it.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
