'use client';

import type { Selection } from '@/lib/data';
import { perMonth } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { changedLevers, LEVER_LABEL, leverValueLabel, sameDependants, whoLabel } from '@/lib/plan';
import { stayingTheSame } from '@/lib/reviewView';
import { usePeople } from '@/lib/store';

export function ChangesTable({ base, selection }: { base: Selection; selection: Selection }) {
  const people = usePeople();
  const now = usePlanPricing(base);
  const next = usePlanPricing(selection);
  const rows: [string, string, string][] = [];
  if (!sameDependants(base, selection)) rows.push(['Who’s covered', whoLabel(base, people), whoLabel(selection, people)]);
  for (const l of changedLevers(base, selection)) rows.push([LEVER_LABEL[l], leverValueLabel(l, base[l]), leverValueLabel(l, selection[l])]);
  rows.push(['What it costs you', perMonth(now.realMonthlyCost), perMonth(next.realMonthlyCost)]);

  return (
    <section aria-labelledby="changing" className="flex flex-col gap-3 rounded-[16px] border border-line px-6 py-[22px]">
      <h2 id="changing" className="text-lg">{rows.length > 1 ? 'What’s changing on 1 April' : 'Your cover from 1 April'}</h2>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="text-xs text-secondary-2">
            <th scope="col" className="py-2 font-medium"><span className="sr-only">Item</span></th>
            <th scope="col" className="py-2 font-medium">Now</th>
            <th scope="col" className="py-2 font-medium">From 1 April</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b], i) => (
            <tr key={k} className={`border-t border-divider ${i === rows.length - 1 ? 'font-semibold' : ''}`}>
              <th scope="row" className="py-2.5 pr-3 font-normal text-secondary">{k}</th>
              <td className="py-2.5 pr-3">{a}</td>
              <td className="py-2.5 font-medium">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[13px] text-secondary">{rows.length > 1 ? stayingTheSame(base, selection) : 'No changes: your cover stays as it is.'}</p>
    </section>
  );
}
