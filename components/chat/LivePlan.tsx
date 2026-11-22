'use client';

import Link from 'next/link';
import { buttonClass } from '@/components/ui/Button';
import type { Selection } from '@/lib/data';
import { excessSaving } from '@/lib/engine/pricing';
import { formatAnnual, formatAnnualExact, formatMonthly, perMonth } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { countChanges, LEVER_LABEL, leverValueLabel, whoLabel, type Lever } from '@/lib/plan';
import { baseline, usePeople, usePersona, usePlan } from '@/lib/store';
import { CoveredPeople } from '@/components/pmi/CoveredPeople';

type Row = { label: string; value: (s: Selection) => string };

export function LivePlan() {
  const persona = usePersona();
  const people = usePeople();
  const { selection, proposal, proposalStatus, status } = usePlan();
  const pending = proposal && proposalStatus === 'pending' ? proposal : null;
  const shown = pending ? pending.selection : selection;
  const now = usePlanPricing(selection);
  const next = usePlanPricing(shown);
  const keep = usePlanPricing(baseline);

  const lever = (l: Lever): Row => ({ label: LEVER_LABEL[l], value: (s) => leverValueLabel(l, s[l]) });
  const rows: Row[] = [lever('tier'), lever('excess'), lever('outpatient'), lever('specialist')];
  const whoChanged = !!pending && whoLabel(selection, people) !== whoLabel(shown, people);

  const nPending = pending ? countChanges(selection, pending.selection) : 0;
  const statusText = pending
    ? `${nPending} suggested ${nPending === 1 ? 'change' : 'changes'}`
    : status !== 'editing' ? 'Confirmed'
    : countChanges(baseline, selection) ? 'Updated, not yet confirmed' : 'No changes yet';

  const pct = (n: number) => `${next.premium > 0 ? (n / next.premium) * 100 : 0}%`;
  const warnings: string[] = [];
  if (shown.excess > 0) {
    const s = excessSaving(shown, people, persona.taxRate);
    warnings.push(`The ${formatAnnual(shown.excess)} excess is paid once per person each year you claim. It saves you about ${formatMonthly(s.monthly)} a month, so it pays off if you claim less than once every ${Math.floor(s.breakEvenMonths)} months.`);
  }
  if (shown.specialist === 'guided') warnings.push('With Guided, AXA picks your specialist from its shortlist, so you can’t ask for a named consultant.');
  if (next.unusedFund === 0 && next.fromFund > 0) warnings.push(`All ${formatAnnual(next.fromFund)} of your Flex Fund goes on health cover, so none is left for other benefits or cash.`);

  return (
    <aside aria-labelledby="live-plan" data-tour="live-plan" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <h2 id="live-plan" className="text-lg">Your plan</h2>
          <span className={`rounded-[6px] px-2 py-[3px] text-xs font-medium ${pending ? 'bg-ai-bg text-ai-text' : status !== 'editing' ? 'bg-success-bg text-success' : 'bg-neutral-chip text-secondary'}`}>{statusText}</span>
        </div>
        <span className="text-xs text-secondary-2">AXA Health · 1 April 2027 to 31 March 2028</span>
      </div>

      <div className={`-mb-2 rounded-[8px] px-2 py-2 ${whoChanged ? 'bg-ai-bg' : ''}`}>
        <CoveredPeople selection={shown} before={pending ? selection : undefined} />
      </div>

      <dl className="m-0 flex flex-col border-t border-divider pt-1">
        {rows.map((r) => {
          const before = r.value(selection);
          const after = r.value(shown);
          const changed = !!pending && before !== after;
          return (
            <div key={r.label} className={`flex justify-between gap-3 border-t border-divider px-2 py-2.5 first:border-t-0 ${changed ? 'rounded-[8px] border-t-transparent bg-ai-bg' : ''}`}>
              <dt className="text-[13px] text-secondary">{r.label}</dt>
              <dd className="m-0 text-right text-[13px]">
                {changed && <del className="mr-1.5 text-secondary-2">{before}</del>}
                <span className={changed ? 'font-semibold text-ai-text' : 'font-medium'}>
                  {changed && <span className="sr-only">changes to </span>}{after}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="flex flex-col gap-0.5" aria-live="polite">
        <span className="text-[13px] text-secondary">What it really costs you</span>
        <span className="text-[26px] font-semibold tracking-tight">
          {pending ? <><span className="text-secondary-2">{formatMonthly(now.realMonthlyCost)}</span> → {formatMonthly(next.realMonthlyCost)}</> : formatMonthly(next.realMonthlyCost)}
          <span className="text-sm font-normal text-secondary"> a month</span>
        </span>
        <span className="text-xs text-secondary-2">Keeping current cover: {perMonth(keep.realMonthlyCost)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-secondary">Who pays the {formatAnnualExact(next.premium)} premium</span>
        <div className="flex h-2.5 overflow-hidden rounded" role="img" aria-label={`Meridian ${formatAnnual(next.employerPays)}, Flex Fund ${formatAnnual(next.fromFund)}, your pay ${formatAnnual(next.fromPay)}`}>
          <div className="bg-fund" style={{ width: pct(next.employerPays) }} />
          <div className="bg-fund-soft" style={{ width: pct(next.fromFund) }} />
          <div className="bg-ink" style={{ width: pct(next.fromPay) }} />
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-secondary">
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-fund" />Meridian {formatAnnual(next.employerPays)}</li>
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-fund-soft" />Flex Fund {formatAnnual(next.fromFund)}</li>
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-ink" />Your pay {formatAnnual(next.fromPay)}</li>
        </ul>
      </div>

      <dl className="m-0 flex flex-col gap-1.5 border-t border-divider pt-3 text-[13px]">
        <div className="flex justify-between gap-3"><dt className="text-secondary">From your pay</dt><dd className="m-0 whitespace-nowrap font-medium">{perMonth(next.fromPayMonthly)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-secondary">Income tax on the benefit (via payroll)</dt><dd className="m-0 whitespace-nowrap font-medium">{perMonth(next.incomeTaxMonthly)}</dd></div>
      </dl>

      {warnings.length > 0 && (
        <div className="flex flex-col gap-1 rounded-[12px] bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <span className="font-semibold">Worth knowing before you commit</span>
          {warnings.map((w) => <p key={w}>{w}</p>)}
        </div>
      )}

      <Link href="/benefits/pmi/review" className={buttonClass('primary', 'w-full')}>Review and confirm</Link>
    </aside>
  );
}
