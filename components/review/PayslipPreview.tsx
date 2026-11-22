'use client';

import { Receipt } from 'lucide-react';
import type { Selection } from '@/lib/data';
import { formatMonthly } from '@/lib/engine/format';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { usePersona } from '@/lib/store';

export function PayslipPreview({ base, selection }: { base: Selection; selection: Selection }) {
  const persona = usePersona();
  const now = usePlanPricing(base);
  const next = usePlanPricing(selection);
  const rows: [string, number, number][] = [
    ['Medical benefit (taxed, not paid to you)', now.taxableBenefitMonthly, next.taxableBenefitMonthly],
    ['Health cover deduction', now.fromPayMonthly, next.fromPayMonthly],
    [`Income tax on the benefit (${Math.round(persona.taxRate * 100)}%)`, now.incomeTaxMonthly, next.incomeTaxMonthly],
  ];
  return (
    <section aria-labelledby="payslip" data-tour="payslip" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand"><Receipt size={18} strokeWidth={1.8} /></span>
        <div className="flex flex-col gap-0.5">
          <h2 id="payslip" className="text-lg">Your April 2027 payslip</h2>
          <p className="text-[13px] text-secondary">From April 2027, tax on medical benefits comes through payroll each month. Here’s what you’ll see.</p>
        </div>
      </div>
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-xs text-secondary-2">
            <th scope="col" className="pb-1.5 font-normal"><span className="sr-only">Line</span></th>
            <th scope="col" className="pb-1.5 pl-3 text-right font-normal">Now</th>
            <th scope="col" className="pb-1.5 pl-3 text-right font-normal">April</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k} className="border-t border-divider">
              <th scope="row" className="py-2.5 pr-2 font-normal text-secondary">{k}</th>
              <td className="whitespace-nowrap py-2.5 pl-3 text-right text-secondary">{formatMonthly(a)}</td>
              <td className="whitespace-nowrap py-2.5 pl-3 text-right font-medium">{formatMonthly(b)}</td>
            </tr>
          ))}
          <tr className="border-t border-line">
            <th scope="row" className="pt-3 pr-2 text-sm font-semibold">Less in your pocket</th>
            <td className="whitespace-nowrap pt-3 pl-3 text-right text-secondary">{formatMonthly(now.realMonthlyCost)}</td>
            <td className="whitespace-nowrap pt-3 pl-3 text-right text-base font-semibold">{formatMonthly(next.realMonthlyCost)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
