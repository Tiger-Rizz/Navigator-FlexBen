'use client';

import Link from 'next/link';
import { useId, useRef, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Bike, CalendarCheck, ChevronDown, ChevronRight, FileText, PiggyBank, Receipt, Sparkles, TrendingUp, Wallet, X } from 'lucide-react';
import { AxaTile } from '@/components/pmi/BenefitHeader';
import { Button } from '@/components/ui/Button';
import { pay, signedMoney } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';
import { AskPayroll } from './AskPayroll';
import { Waterfall } from './Waterfall';

const ROW_ICON: Record<string, ReactNode> = {
  rise: <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-success-bg text-success"><TrendingUp size={18} strokeWidth={1.8} /></span>,
  cycle: <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-warning-soft text-warning"><Bike size={18} strokeWidth={1.8} /></span>,
  health: <AxaTile size={40} />,
  pension: <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand"><PiggyBank size={18} strokeWidth={1.8} /></span>,
};

export function PayExplained() {
  const s = usePart2();
  const april = s.month === 'april';

  const pick = (id: string) => {
    s.openRowOnly(id);
    requestAnimationFrame(() => document.getElementById(`pay-row-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  return (
    <>
      <PayHeader />
      <div className="rise relative px-4 pb-24 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
        {april ? (
          <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <Summary openId={s.openRow} onPick={pick} />
              <Changes />
              <AskPayroll />
            </div>
            <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[340px]">
              <Payslip />
              <AskAboutPay />
            </div>
          </div>
        ) : (
          <section aria-labelledby="march" className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 rounded-[16px] border border-line bg-white px-6 py-6">
            <span aria-hidden className="flex size-11 items-center justify-center rounded-full bg-success-bg text-success"><CalendarCheck size={20} strokeWidth={1.8} /></span>
            <div className="flex min-w-[220px] flex-1 flex-col gap-0.5">
              <h2 id="march" className="text-lg">No changes in March</h2>
              <p className="text-sm text-secondary">{pay.march.replace(/^Nothing changed in March\. /, '')}</p>
            </div>
            <Button variant="secondary" onClick={() => s.setMonth('april')}>See April’s changes<ArrowRight aria-hidden size={16} /></Button>
          </section>
        )}
      </div>
    </>
  );
}

/** Same band as the benefit pages: breadcrumb, tile, title, and the month switch on the right. */
function PayHeader() {
  const s = usePart2();
  return (
    <div className="bg-brand-tint px-4 pb-8 pt-6 min-[900px]:px-12 lg:pb-20">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-secondary-2">
          <Link href="/home" aria-label="Back to home" className="-my-3 -ml-2 flex size-11 items-center justify-center rounded-lg text-ink">
            <ArrowLeft aria-hidden size={16} />
          </Link>
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            <li><Link href="/home" className="-my-3 inline-flex min-h-11 items-center text-secondary-2">Home</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-ink">My pay</li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-[12px] bg-brand text-white"><Wallet size={28} strokeWidth={1.8} /></span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-secondary">Meridian Payroll · {s.month === 'april' ? pay.period.replace(' payslip', '') : pay.marchPeriod.replace(' payslip', '')}</span>
            <h1 className="text-[28px]">Your pay, explained</h1>
          </div>
          <div role="group" aria-label="Month" className="inline-flex rounded-full border border-brand-tint-border bg-white p-1 sm:ml-auto">
            {(['march', 'april'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={s.month === m}
                onClick={() => s.setMonth(m)}
                className={`min-h-11 rounded-full px-4 text-sm cursor-pointer transition-colors ${s.month === m ? 'bg-ink font-medium text-white' : 'text-secondary hover:text-ink'}`}
              >
                {m === 'march' ? 'March' : 'April'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Summary({ openId, onPick }: { openId: string | null; onPick: (id: string) => void }) {
  return (
    <section aria-labelledby="pay-headline" data-tour="pay-summary" className="flex flex-col gap-5 rounded-[16px] border border-line bg-white px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-[260px] flex-1 flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ai-text"><Sparkles aria-hidden size={14} strokeWidth={1.8} className="text-ai-icon" />Your April payslip in a sentence</span>
          <h2 id="pay-headline" className="text-[22px] leading-snug">{pay.summary.headline}</h2>
          <p className="text-[15px] text-ink-2">{pay.summary.sub}</p>
        </div>
        <dl className="m-0 flex gap-6 lg:flex-col lg:gap-3 lg:text-right">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-secondary">Pay rise before tax</dt>
            <dd className="m-0 text-[22px] font-semibold tabular-nums">{signedMoney(pay.payRiseBeforeTax)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-secondary">Change in take-home</dt>
            <dd className="m-0 text-[22px] font-semibold tabular-nums text-success">{signedMoney(pay.takeHomeChange)}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-col gap-3 border-t border-divider pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">What moved your take-home</h3>
          <span className="text-xs text-secondary-2">Select a bar to see the maths</span>
        </div>
        <Waterfall openId={openId} onPick={onPick} />
      </div>
      <span className="text-xs text-secondary-2">{pay.summary.source}</span>
    </section>
  );
}

function Changes() {
  const s = usePart2();
  const id = useId();
  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-2 rounded-[16px] border border-line bg-white px-4 py-5 sm:px-5">
      <h2 id={`${id}-h`} className="px-2 pb-1 text-lg">What changed since March</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {pay.rows.map((r) => {
          const open = s.openRow === r.id;
          const up = r.takeHome > 0;
          const panel = `${id}-${r.id}`;
          return (
            <li key={r.id} id={`pay-row-${r.id}`} data-tour={`pay-row-${r.id}`} className={`scroll-mt-6 rounded-[12px] transition-colors ${open ? 'bg-[#F7F8F6]' : 'hover:bg-[#FAFAF9]'}`}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panel}
                onClick={() => s.toggleRow(r.id)}
                className="flex min-h-11 w-full items-center gap-3.5 rounded-[12px] px-2 py-3 text-left cursor-pointer sm:px-3"
              >
                {ROW_ICON[r.id]}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold leading-snug">{r.title}</span>
                  <span className="text-[13px] text-secondary">{r.sub}</span>
                </span>
                <span className="flex flex-col items-end">
                  <span className={`text-base font-semibold tabular-nums ${up ? 'text-success' : ''}`}>{signedMoney(r.takeHome)}</span>
                  <span className="text-[11px] text-secondary-2">take-home</span>
                </span>
                <ChevronDown aria-hidden size={16} className={`shrink-0 text-secondary-2 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div id={panel} className="fade-in flex flex-col gap-3 px-3 pb-4 sm:pl-[68px] sm:pr-5">
                  <p className="text-sm leading-relaxed text-ink-2">{r.explain}</p>
                  <dl className="m-0 flex flex-col rounded-[12px] border border-line bg-white px-4 py-1 text-[13px]">
                    {r.maths.map((m) => (
                      <div key={m.label} className="flex items-baseline justify-between gap-3 border-t border-divider py-2 first:border-t-0">
                        <dt className="text-secondary">{m.label}</dt>
                        <dd className="m-0 font-medium tabular-nums">{signedMoney(m.amount)}</dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-3 border-t border-line-control py-2.5">
                      <dt className="font-semibold">Your take-home</dt>
                      <dd className={`m-0 font-semibold tabular-nums ${up ? 'text-success' : ''}`}>{signedMoney(r.takeHome)} a month</dd>
                    </div>
                  </dl>
                  <Link href={r.link.href} className="-mt-1 inline-flex min-h-11 items-center gap-1.5 self-start text-[13px] font-medium">
                    <span aria-hidden className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded px-[3px] text-[8px] font-bold" style={{ background: r.link.tileBg, color: r.link.tileFg }}>{r.link.tile}</span>
                    <span className="underline underline-offset-2">{r.link.label}</span>
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** "Medical benefit (taxed, not paid to you)" → name + note. */
const splitLabel = (l: string) => {
  const m = l.match(/^(.*?) \((.*)\)$/);
  return m ? { name: m[1], note: m[2] } : { name: l, note: null };
};

function Payslip() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <section aria-labelledby={`${id}-h`} data-tour="pay-lines" className="flex flex-col rounded-[16px] border border-line bg-white">
      <div className="flex items-center gap-3 px-5 pb-2 pt-5">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand"><Receipt size={18} strokeWidth={1.8} /></span>
        <div className="flex flex-col">
          <h2 id={`${id}-h`} className="text-base font-semibold">Lines that changed</h2>
          <span className="text-xs text-secondary-2">On your payslip, March to April</span>
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col px-5 p-0">
        {pay.lines.map((l) => {
          const { name, note } = splitLabel(l.label);
          const isNew = l.march === '—';
          return (
            <li key={l.label} className="flex items-center justify-between gap-3 border-t border-divider py-3 first:border-t-0">
              <span className="flex min-w-0 flex-col">
                <span className="text-[13px] font-medium leading-snug">{name}</span>
                {note && <span className="text-xs text-secondary-2">{note}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[13px] tabular-nums">
                {isNew ? (
                  <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] font-medium text-brand">New<span className="sr-only"> in April</span></span>
                ) : (
                  <>
                    <span className="text-xs text-secondary-2"><span className="sr-only">March </span>{l.march}</span>
                    <ArrowRight aria-hidden size={12} className="text-secondary-2" />
                  </>
                )}
                <span className="font-semibold"><span className="sr-only">April </span>{l.april}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="px-5 pb-5 pt-2">
        <Button variant="secondary" className="w-full" onClick={() => dialogRef.current?.showModal()}><FileText aria-hidden size={16} />View full payslip</Button>
      </div>
      <dialog ref={dialogRef} aria-labelledby={`${id}-slip`} className="m-auto w-[min(520px,calc(100%-2rem))] rounded-[16px] border border-line p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[3px]">
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-10 items-center justify-center rounded-[10px] bg-brand text-white"><Wallet size={18} strokeWidth={1.8} /></span>
            <div className="flex flex-1 flex-col">
              <h2 id={`${id}-slip`} className="text-lg">April 2027 payslip</h2>
              <span className="text-xs text-secondary-2">Paid 30 April by Meridian Payroll</span>
            </div>
            <button type="button" aria-label="Close" onClick={() => dialogRef.current?.close()} className="flex size-11 items-center justify-center rounded-[10px] cursor-pointer hover:bg-surface-2"><X aria-hidden size={18} /></button>
          </div>
          <LinesTable />
          <p className="text-xs text-secondary-2">Lines that didn’t change since March are left out of this prototype.</p>
        </div>
      </dialog>
    </section>
  );
}

function LinesTable() {
  return (
    <table className="w-full border-collapse text-left text-[13px]">
      <thead>
        <tr className="text-xs text-secondary-2">
          <th scope="col" className="py-1.5 font-normal"><span className="sr-only">Line</span></th>
          <th scope="col" className="py-1.5 pl-3 text-right font-normal">March</th>
          <th scope="col" className="py-1.5 pl-3 text-right font-normal">April</th>
        </tr>
      </thead>
      <tbody>
        {pay.lines.map((l) => (
          <tr key={l.label} className="border-t border-divider">
            <th scope="row" className="py-2.5 pr-2 font-normal text-secondary">{l.label}</th>
            <td className="whitespace-nowrap py-2.5 pl-3 text-right tabular-nums text-secondary">{l.march}</td>
            <td className="whitespace-nowrap py-2.5 pl-3 text-right font-semibold tabular-nums">{l.april}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AskAboutPay() {
  const openAsk = usePlan((p) => p.openAsk);
  return (
    <section aria-labelledby="ask-pay" className="flex flex-col gap-1 rounded-[16px] border border-ai-border bg-ai-soft px-4 py-4">
      <h2 id="ask-pay" className="flex items-center gap-1.5 px-1 pb-1 text-sm font-semibold text-ai-text"><Sparkles aria-hidden size={15} strokeWidth={1.8} className="text-ai-icon" />Ask about your pay</h2>
      {pay.questions.map((q) => (
        <button key={q.q} type="button" onClick={() => openAsk(q.q)} className="flex min-h-11 items-center gap-2 rounded-[10px] px-2 text-left text-sm cursor-pointer hover:bg-white">
          <span className="flex-1">{q.q}</span>
          <ChevronRight aria-hidden size={15} className="text-ai-icon" />
        </button>
      ))}
    </section>
  );
}
