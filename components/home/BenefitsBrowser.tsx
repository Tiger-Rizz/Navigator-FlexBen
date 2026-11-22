'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Building2, List, PiggyBank, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { usePersona, usePlan } from '@/lib/store';

type Category = 'insurance' | 'non-insurance' | 'company';
interface Benefit { id: string; provider: string; name: string; text: string; category: Category; band: string; tile: string; tileClass: string; href?: string; features?: string }

const BENEFITS: Benefit[] = [
  { id: 'pmi', provider: 'AXA Health', name: 'Private Medical Insurance', text: 'Fast access to specialists, tests and treatment, with a virtual GP day or night.', category: 'insurance', band: 'bg-[#DCE3F5]', tile: 'AXA', tileClass: 'bg-axa text-white', href: '/benefits/pmi', features: '8 features' },
  { id: 'dental', provider: 'Meridian Dental Plan', name: 'Dental Insurance', text: 'Money back on check-ups and treatment with the dentist of your choice.', category: 'insurance', band: 'bg-[#D9ECF7]', tile: 'MD', tileClass: 'bg-[#1B6FA8] text-white' },
  { id: 'ci', provider: 'Legal & General', name: 'Critical Illness Insurance', text: 'A tax-free lump sum if you’re diagnosed with one of a range of serious conditions.', category: 'insurance', band: 'bg-[#E6E6E3]', tile: 'L&G', tileClass: 'bg-white text-ink-2' },
  { id: 'life', provider: 'Legal & General', name: 'Life Assurance', text: 'Four times your salary, paid tax-free to the people you choose.', category: 'insurance', band: 'bg-[#E6E6E3]', tile: 'L&G', tileClass: 'bg-white text-ink-2' },
  { id: 'ip', provider: 'Aviva', name: 'Income Protection', text: 'Part of your salary paid if you’re off work sick for a long time.', category: 'insurance', band: 'bg-[#FBEDB5]', tile: 'AV', tileClass: 'bg-[#F5C400] text-ink' },
  { id: 'pension', provider: 'Aviva', name: 'Pension', text: 'You pay 5% through salary sacrifice and Meridian adds 8%.', category: 'non-insurance', band: 'bg-[#F3E9D8]', tile: 'AV', tileClass: 'bg-[#F5C400] text-ink' },
  { id: 'c2w', provider: 'Meridian Group', name: 'Cycle to work', text: 'A new bike and kit, paid for from your salary before tax over 12 months.', category: 'non-insurance', band: 'bg-[#E3F1D9]', tile: 'C2W', tileClass: 'bg-[#4E8A2A] text-white' },
  { id: 'flex', provider: 'Meridian Group', name: 'Flex Fund 2027–28', text: '£500 a year to put towards benefits, or take as cash.', category: 'company', band: 'bg-brand-tint', tile: '£500', tileClass: 'bg-white text-brand' },
  { id: 'wellbeing', provider: 'Meridian Group', name: 'Wellbeing Allowance', text: '£500 a year for eye care, gym memberships and more.', category: 'company', band: 'bg-brand-tint', tile: 'WA', tileClass: 'bg-brand text-white' },
];

const FILTERS: { id: 'all' | Category; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: List },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck },
  { id: 'non-insurance', label: 'Non-insurance', icon: PiggyBank },
  { id: 'company', label: 'Company-delivered', icon: Building2 },
];

export function BenefitsBrowser() {
  const [filter, setFilter] = useState<'all' | Category>('insurance');
  const persona = usePersona();
  const { selection, status } = usePlan();
  const actionNeeded = status === 'editing' && persona.peopleOnRecord.some((p) => !selection.dependants.includes(p.id));
  const shown = BENEFITS.filter((b) => filter === 'all' || b.category === filter);
  const heading = FILTERS.find((f) => f.id === filter)!.label;

  return (
    <div className="rise mx-auto flex max-w-[1180px] flex-col gap-6">
      <div role="group" aria-label="Filter benefits" className="flex flex-wrap justify-center gap-2 border-b border-line pb-5">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium cursor-pointer ${filter === id ? 'border-ink bg-ink text-white' : 'border-line-control bg-white hover:bg-surface-2'}`}
          >
            <Icon aria-hidden size={16} strokeWidth={1.8} />{label}
          </button>
        ))}
      </div>
      <h1 className="text-[22px]">{filter === 'all' ? 'All benefits' : heading} <span className="font-normal text-secondary">({shown.length})</span></h1>
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((b) => {
          const inner = (
            <>
              <div className={`relative flex h-[104px] items-center justify-center ${b.band}`}>
                {b.features && <span className="absolute left-2.5 top-2.5 rounded-[6px] bg-white/90 px-2 py-0.5 text-[11px]">{b.features}</span>}
                <span aria-hidden className={`flex size-[60px] items-center justify-center rounded-[10px] text-[15px] font-bold ${b.tileClass}`}>{b.tile}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1 px-4 py-3.5">
                <span className="text-xs text-secondary-2">{b.provider}</span>
                <span className="font-semibold">{b.name}</span>
                <span className="text-[13px] leading-snug text-secondary">{b.text}</span>
                {b.id === 'pmi' && actionNeeded && <Badge tone="warning" className="mt-1 self-start">Action needed</Badge>}
              </div>
            </>
          );
          return (
            <li key={b.id}>
              {b.href ? (
                <Link href={b.href} className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white no-underline transition-shadow hover:border-line-control hover:shadow-[0_2px_12px_rgba(20,20,20,0.06)]">{inner}</Link>
              ) : (
                <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-white">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
