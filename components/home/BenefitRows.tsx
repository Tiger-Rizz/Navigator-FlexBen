'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Eye, Heart, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { employer } from '@/lib/data';
import { daysLeft } from '@/lib/engine/rules';
import { usePersona, usePlan } from '@/lib/store';
import { BENEFITS, BenefitCard } from './BenefitsBrowser';

const RECENT: { tile: string; tileClass: string; name: string; provider: string; text: string; href: string; why: ReactNode }[] = [
  { tile: 'AXA', tileClass: 'bg-axa text-white', name: 'Physiotherapy and osteopathy', provider: 'AXA Health', text: 'Up to 10 sessions a year without a GP referral.', href: '/benefits/pmi/cover#features', why: <><Heart aria-hidden size={12} />Bones, joints & muscles</> },
  { tile: 'MW', tileClass: 'bg-[#DDEFEA] text-brand', name: 'Mental wellbeing app', provider: 'Meridian Group', text: 'Courses, check-ins and support from clinicians.', href: '/benefits', why: <><Heart aria-hidden size={12} />Mental health & wellbeing</> },
  { tile: 'AXA', tileClass: 'bg-axa text-white', name: 'Virtual GP', provider: 'AXA Health', text: 'Phone and video appointments, 24/7.', href: '/benefits/pmi', why: <><Eye aria-hidden size={12} />You viewed this</> },
  { tile: 'EAP', tileClass: 'bg-[#F3E9D8] text-avatar-text', name: 'Employee assistance', provider: 'Meridian Group', text: 'Free, confidential counselling by phone.', href: '/benefits', why: <><Users aria-hidden size={12} />Popular at Meridian</> },
];

const TOP = ['pmi', 'life', 'flex', 'pension'];

/** Key dates as calendar tiles, like the review timeline. */
function ComingUp() {
  const status = usePlan((s) => s.status);
  const done = status !== 'editing';
  const days = daysLeft(employer.demoToday);
  const items = [
    done
      ? { month: 'Mar', day: '31', title: 'Your choices are in', detail: 'Change them until then', href: '/my-choices', tone: 'done' as const }
      : { month: 'Mar', day: '31', title: 'Enrolment closes', detail: `${days} days left`, href: '/benefits/pmi', tone: 'urgent' as const },
    { month: 'Apr', day: '1', title: 'New cover year', detail: `${employer.coverYear.label} health cover`, href: '/benefits/pmi', tone: 'key' as const },
    { month: 'Apr', day: '6', title: 'Payrolled benefits', detail: 'A new payslip line', href: '/pay', tone: 'plain' as const },
    { month: 'Apr', day: '30', title: 'April payday', detail: 'Your pay, explained', href: '/pay', tone: 'plain' as const },
  ];
  const head = { urgent: 'bg-warning-bg text-warning', done: 'bg-success-bg text-success', key: 'bg-black/15', plain: 'bg-brand-tint text-brand' };

  return (
    <section aria-labelledby="coming-up" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <h2 id="coming-up" className="text-lg">Coming up</h2>
        <span className="text-xs text-secondary-2">From your enrolment and payroll calendar</span>
      </div>
      <ol className="m-0 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <li key={it.day + it.month}>
            <Link href={it.href} className="group flex min-h-11 items-center gap-3.5 rounded-[12px] p-2.5 no-underline transition-colors hover:bg-[#FAFAF9]">
              <span aria-hidden className={`flex w-[46px] shrink-0 flex-col overflow-hidden rounded-[10px] border text-center ${it.tone === 'key' ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`}>
                <span className={`py-0.5 text-[10px] font-semibold uppercase tracking-wide ${head[it.tone]}`}>{it.month}</span>
                <span className="py-0.5 text-[17px] font-semibold leading-tight">{it.day}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {it.tone === 'done' && <Check aria-hidden size={14} strokeWidth={2.5} className="text-success" />}
                  {it.title}<span className="sr-only">, {it.day} {it.month === 'Mar' ? 'March' : 'April'}</span>
                </span>
                <span className={`text-xs ${it.tone === 'urgent' ? 'font-medium text-warning' : 'text-secondary'}`}>{it.detail}</span>
              </span>
              <ArrowRight aria-hidden size={14} className="shrink-0 text-secondary-2 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionHead({ id, title, action }: { id: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg">{title}</h2>
      {action}
    </div>
  );
}

/** Rows scroll sideways on phones, like the Navigator app, and sit in a grid on wider screens. */
const row = 'm-0 -mx-4 flex list-none snap-x snap-mandatory scroll-px-4 gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4';

export function BenefitRows() {
  const persona = usePersona();
  const { selection, status } = usePlan();
  const gap = persona.peopleOnRecord.some((p) => !selection.dependants.includes(p.id)) && status === 'editing';
  return (
    <>
      <ComingUp />
      <section aria-labelledby="recent" className="flex flex-col gap-3.5">
        <SectionHead id="recent" title="Based on your recent activity" />
        <ul tabIndex={0} aria-label="Based on your recent activity, scroll sideways for more" className={row}>
          {RECENT.map((r) => (
            <li key={r.name} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Link href={r.href} className="group flex h-full flex-col gap-3 rounded-[16px] border border-line bg-white p-5 no-underline transition-shadow hover:border-line-control hover:shadow-[0_2px_12px_rgba(20,20,20,0.06)]">
                <div className="flex items-start justify-between">
                  <span aria-hidden className={`flex size-11 items-center justify-center rounded-[10px] text-xs font-bold ${r.tileClass}`}>{r.tile}</span>
                  <ArrowUpRight aria-hidden size={16} className="text-secondary-2 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold leading-snug">{r.name}</span>
                  <span className="text-xs text-secondary-2">{r.provider}</span>
                </div>
                <p className="text-[13px] leading-snug text-secondary">{r.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-2">{r.why}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="top" className="flex flex-col gap-3.5">
        <SectionHead
          id="top"
          title="Top benefits for you"
          action={<Link href="/benefits" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium no-underline hover:underline">See all<ArrowRight aria-hidden size={14} /></Link>}
        />
        <ul tabIndex={0} aria-label="Top benefits for you, scroll sideways for more" className={row}>
          {TOP.map((id) => BENEFITS.find((b) => b.id === id)!).map((b) => (
            <li key={b.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <BenefitCard b={b} actionNeeded={b.id === 'pmi' && gap} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
