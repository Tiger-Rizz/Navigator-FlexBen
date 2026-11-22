'use client';

import { ArrowRight, Check } from 'lucide-react';
import type { Selection } from '@/lib/data';
import { formatMonthly } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { changedLevers, LEVER_LABEL, leverValueLabel, sameDependants, whoLabel } from '@/lib/plan';
import { stayingTheSame } from '@/lib/reviewView';
import { usePeople } from '@/lib/store';

/** What changes on 1 April, as compact before → after rows, with the cost given most weight. */
export function ChangesTable({ base, selection }: { base: Selection; selection: Selection }) {
  const people = usePeople();
  const now = usePlanPricing(base);
  const next = usePlanPricing(selection);
  const rows: [string, string, string][] = [];
  if (!sameDependants(base, selection)) rows.push(['Who’s covered', whoLabel(base, people), whoLabel(selection, people)]);
  for (const l of changedLevers(base, selection)) rows.push([LEVER_LABEL[l], leverValueLabel(l, base[l]), leverValueLabel(l, selection[l])]);
  const same = stayingTheSame(base, selection).replace(/^Staying the same: /, '');

  return (
    <section aria-labelledby="changing" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="changing" className="text-lg">{rows.length ? 'What’s changing on 1 April' : 'Your cover from 1 April'}</h2>
        <span className="text-xs text-secondary">{rows.length ? `${rows.length} ${rows.length === 1 ? 'change' : 'changes'}` : 'No changes'}</span>
      </div>
      {rows.length > 0 && (
        <dl className="m-0 flex flex-col">
          {rows.map(([k, a, b]) => (
            <div key={k} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-divider py-3 first:border-t-0 first:pt-0">
              <dt className="text-[13px] text-secondary">{k}</dt>
              <dd className="m-0 flex items-center gap-2 text-sm">
                <span className="text-secondary">{a}</span>
                <ArrowRight aria-label="to" size={13} className="text-secondary-2" />
                <span className="rounded-[6px] bg-ai-bg px-2 py-0.5 font-medium text-ai-text">{b}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#F7F8F6] px-4 py-3">
        <span className="text-[13px] text-secondary">What it really costs you</span>
        <span className="flex items-baseline gap-2">
          {rows.length > 0 && <><span className="text-sm text-secondary">{formatMonthly(now.realMonthlyCost)}</span><ArrowRight aria-label="to" size={13} className="self-center text-secondary-2" /></>}
          <span className="text-xl font-semibold">{formatMonthly(next.realMonthlyCost)}</span>
          <span className="text-[13px] text-secondary">a month</span>
        </span>
      </div>
      <p className="flex items-start gap-2 text-[13px] text-secondary">
        <Check aria-hidden size={15} className="mt-0.5 shrink-0 text-success" />
        <span><span className="font-medium text-ink">Staying the same: </span>{same}</span>
      </p>
    </section>
  );
}
