'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { usePersona, usePlan } from '@/lib/store';

const RECENT = [
  { tile: 'AXA', tileClass: 'bg-axa text-white', name: 'Physiotherapy and osteopathy', provider: 'AXA Health', text: 'Up to 10 sessions a year without a GP referral.' },
  { tile: 'MW', tileClass: 'bg-[#DDEFEA] text-brand', name: 'Mental wellbeing app', provider: 'Meridian Group', text: 'Courses, check-ins and support from clinicians.' },
  { tile: 'AXA', tileClass: 'bg-axa text-white', name: 'Virtual GP', provider: 'AXA Health', text: 'Phone and video appointments, 24/7.' },
  { tile: 'EAP', tileClass: 'bg-[#F3E9D8] text-avatar-text', name: 'Employee assistance', provider: 'Meridian Group', text: 'Free, confidential counselling by phone.' },
];

export function BenefitRows() {
  const persona = usePersona();
  const { selection, status } = usePlan();
  const gap = persona.peopleOnRecord.some((p) => !selection.dependants.includes(p.id)) && status === 'editing';
  return (
    <>
      <section aria-labelledby="recent" className="flex flex-col gap-3.5">
        <h2 id="recent" className="text-[17px]">Based on your recent activity</h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-3.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((r) => (
            <li key={r.name} className="flex flex-col gap-1.5 rounded-[12px] border border-line px-4 py-3.5">
              <span aria-hidden className={`flex size-[34px] items-center justify-center rounded-[7px] text-[11px] font-bold ${r.tileClass}`}>{r.tile}</span>
              <span className="font-semibold">{r.name}</span>
              <span className="text-xs text-secondary-2">{r.provider}</span>
              <span className="text-[13px] leading-snug text-ink-2">{r.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="top" className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 id="top" className="text-[17px]">Top benefits for you</h2>
          <Link href="/benefits" className="inline-flex min-h-11 items-center rounded-[8px] border border-[#E4E4E4] px-3 text-[13px] no-underline">See all</Link>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-3.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <Link href="/benefits/pmi" className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line no-underline hover:border-line-control">
              <div className="relative flex h-[78px] items-center justify-center bg-[#DCE3F5]">
                <span className="absolute left-2.5 top-2.5 rounded-[5px] bg-white px-1.5 py-0.5 text-[11px]">55 features</span>
                <span className="rounded-[6px] bg-axa px-[11px] py-[9px] text-base font-bold text-white">AXA</span>
              </div>
              <div className="flex flex-col gap-1 px-[15px] py-[13px]">
                <span className="text-xs text-secondary-2">AXA Health</span>
                <span className="font-semibold">Private Medical Insurance</span>
                {gap && <Badge tone="warning" className="self-start">Action needed</Badge>}
              </div>
            </Link>
          </li>
          {[
            { band: 'bg-[#E6E6E3]', logo: <span className="text-sm font-semibold text-ink-2">Legal &amp; General</span>, provider: 'Legal & General', name: 'Life Assurance', text: '4× salary' },
            { band: 'bg-brand-tint', logo: <span className="text-[19px] font-semibold text-brand">£500</span>, provider: 'Meridian Group', name: 'Flex Fund 2027–28', text: 'Not yet allocated' },
            { band: 'bg-[#F3E9D8]', logo: <span className="text-sm font-semibold text-avatar-text">Aviva</span>, provider: 'Aviva', name: 'Pension', text: 'Meridian pays 8%' },
          ].map((c) => (
            <li key={c.name} className="flex flex-col overflow-hidden rounded-[14px] border border-line">
              <div className={`flex h-[78px] items-center justify-center ${c.band}`}>{c.logo}</div>
              <div className="flex flex-col gap-1 px-[15px] py-[13px]">
                <span className="text-xs text-secondary-2">{c.provider}</span>
                <span className="font-semibold">{c.name}</span>
                <span className="text-[13px] text-ink-2">{c.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
