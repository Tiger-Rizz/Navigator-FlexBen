'use client';

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
    <section aria-labelledby="payslip" data-tour="payslip" className="flex flex-col gap-3 rounded-[16px] border border-line px-6 py-[22px]">
      <h2 id="payslip" className="text-lg">Your April 2027 payslip</h2>
      <p className="text-[13px] text-secondary">From April 2027, tax on medical benefits is collected through payroll each month, so here’s what you’ll actually see.</p>
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-xs text-secondary-2">
            <th scope="col" className="py-1.5 font-medium"><span className="sr-only">Line</span></th>
            <th scope="col" className="py-1.5 pl-3 text-right font-medium">Now</th>
            <th scope="col" className="py-1.5 pl-3 text-right font-medium">April</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, a, b]) => (
            <tr key={k} className="border-t border-divider">
              <th scope="row" className="py-2 pr-2 font-normal text-secondary">{k}</th>
              <td className="whitespace-nowrap py-2 pl-3 text-right">{formatMonthly(a)}</td>
              <td className="whitespace-nowrap py-2 pl-3 text-right font-medium">{formatMonthly(b)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-line font-semibold">
            <th scope="row" className="py-2 pr-2">Less in your pocket</th>
            <td className="whitespace-nowrap py-2 pl-3 text-right">{formatMonthly(now.realMonthlyCost)}</td>
            <td className="whitespace-nowrap py-2 pl-3 text-right">{formatMonthly(next.realMonthlyCost)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
