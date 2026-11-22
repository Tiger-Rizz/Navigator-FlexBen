'use client';

import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { pay, signedMoney } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';

export function PayExplained() {
  const s = usePart2();
  const openAsk = usePlan((p) => p.openAsk);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  return (
    <div className="flex flex-col gap-5 px-4 pb-16 pt-8 min-[900px]:px-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-secondary-2">{pay.period}</span>
          <h1 className="text-[26px]">Your pay, explained</h1>
        </div>
        <div role="group" aria-label="Month" className="flex gap-2">
          {(['march', 'april'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={s.month === m}
              onClick={() => s.setMonth(m)}
              className={`min-h-11 rounded-[10px] border px-3.5 text-sm cursor-pointer ${s.month === m ? 'border-ink bg-ink font-medium text-white' : 'border-line-control bg-white hover:bg-surface-2'}`}
            >
              {m === 'march' ? 'March' : 'April'}
            </button>
          ))}
        </div>
      </div>

      {s.month === 'march' ? (
        <section className="rounded-[16px] border border-line px-6 py-[22px] text-secondary">{pay.march}</section>
      ) : (
        <>
          <section aria-label="Summary" data-tour="pay-summary" className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[16px] border border-ai-border bg-white px-6 py-5">
            <div className="flex min-w-[300px] flex-1 gap-4">
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ai-bg"><Sparkles size={16} strokeWidth={1.8} className="text-ai-icon" /></span>
              <div className="flex flex-col gap-1">
                <p className="text-[17px] leading-relaxed">{pay.summary.lead}<strong className="font-semibold">{pay.summary.strong}</strong>{pay.summary.rest}</p>
                <span className="text-xs text-secondary-2">{pay.summary.source}</span>
              </div>
            </div>
            <dl className="m-0 flex gap-7">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-secondary">Pay rise before tax</dt>
                <dd className="m-0 text-2xl font-semibold">{signedMoney(pay.payRiseBeforeTax)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-secondary">Change in take-home</dt>
                <dd className="m-0 text-2xl font-semibold text-success">{signedMoney(pay.takeHomeChange)}</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <section aria-labelledby={`${id}-changed`} className="flex min-w-0 flex-[3] flex-col gap-2.5">
              <h2 id={`${id}-changed`} className="mb-1 text-[17px]">What changed since March</h2>
              {pay.rows.map((r) => {
                const open = s.openRow === r.id;
                const up = r.takeHome > 0;
                return (
                  <div key={r.id} data-tour={`pay-row-${r.id}`} className={`rounded-[14px] border ${open ? 'border-ai-highlight bg-ai-soft' : 'border-line bg-white'}`}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`${id}-${r.id}`}
                      onClick={() => s.toggleRow(r.id)}
                      className="flex min-h-11 w-full items-center gap-3.5 px-[18px] py-4 text-left cursor-pointer"
                    >
                      <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: up ? '#1D8A4F' : '#B5651D' }} />
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span className="text-[15px] font-semibold">{r.title}</span>
                        <span className="text-[13px] text-secondary">{r.sub}</span>
                      </span>
                      <span className="flex flex-col items-end">
                        <span className={`text-base font-semibold ${up ? 'text-success' : ''}`}>{signedMoney(r.takeHome)}</span>
                        <span className="text-[11px] text-secondary-2">take-home</span>
                      </span>
                    </button>
                    {open && (
                      <div id={`${id}-${r.id}`} className="flex flex-col gap-2.5 pb-4 pl-[42px] pr-[18px]">
                        <p className="text-sm leading-relaxed text-[#2E2E2E]">{r.explain}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link href={r.link.href} className="inline-flex min-h-11 items-center gap-1.5 text-[13px]">
                            <span aria-hidden className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded px-[3px] text-[8px] font-bold" style={{ background: r.link.tileBg, color: r.link.tileFg }}>{r.link.tile}</span>
                            <span className="underline">{r.link.label}</span>
                          </Link>
                          <span className="text-[11px] text-muted">{r.source}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <AskPayroll />
            </section>

            <aside aria-labelledby={`${id}-lines`} data-tour="pay-lines" className="flex w-full flex-col gap-3 rounded-[16px] border border-line px-5 py-[22px] lg:w-[440px] lg:shrink-0">
              <h2 id={`${id}-lines`} className="text-[17px]">Lines that changed</h2>
              <LinesTable />
              <button type="button" onClick={() => dialogRef.current?.showModal()} className="min-h-11 self-start text-[13px] underline underline-offset-2 cursor-pointer">View full payslip</button>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary">Ask about your pay</span>
                {pay.questions.map((q) => (
                  <button key={q.q} type="button" onClick={() => openAsk(q.q)} className="flex min-h-11 items-center gap-2 rounded-[8px] px-1 text-left text-sm cursor-pointer hover:bg-ai-soft">
                    <Sparkles aria-hidden size={14} strokeWidth={1.8} className="shrink-0 text-ai-icon" />{q.q}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}

      <dialog ref={dialogRef} aria-labelledby={`${id}-slip`} className="m-auto w-[min(520px,calc(100%-2rem))] rounded-[16px] border border-line p-0 backdrop:bg-black/40">
        <div className="flex flex-col gap-3 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 id={`${id}-slip`} className="text-lg">April 2027 payslip</h2>
            <button type="button" aria-label="Close" onClick={() => dialogRef.current?.close()} className="flex size-11 items-center justify-center rounded-[10px] cursor-pointer hover:bg-surface-2"><X aria-hidden size={18} /></button>
          </div>
          <LinesTable />
          <p className="text-xs text-secondary-2">Lines that didn’t change since March are left out of this prototype. Paid 30 April by Meridian Payroll.</p>
        </div>
      </dialog>
    </div>
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
            <th scope="row" className="py-2 pr-2 font-normal text-secondary">{l.label}</th>
            <td className="whitespace-nowrap py-2 pl-3 text-right text-secondary">{l.march}</td>
            <td className="whitespace-nowrap py-2 pl-3 text-right font-semibold">{l.april}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AskPayroll() {
  const s = usePart2();
  const id = useId();
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (s.flag === 'open') selectRef.current?.focus({ preventScroll: true });
  }, [s.flag]);
  const err = s.flagTried && !s.flagLine;

  return (
    <div data-tour="pay-flag" className="mt-2 flex flex-col gap-3 rounded-[14px] border border-line px-[18px] py-4">
      {s.flag === 'closed' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Something look wrong?</span>
            <span className="text-[13px] text-secondary">Ask payroll with the context already attached. No need to explain from scratch.</span>
          </div>
          <button type="button" onClick={() => s.setFlag('open')} className="min-h-11 rounded-[10px] border border-line-control bg-white px-3.5 text-sm cursor-pointer hover:bg-surface-2">Ask payroll</button>
        </div>
      )}
      {s.flag === 'open' && (
        <form className="flex flex-col gap-3" noValidate onSubmit={(e) => { e.preventDefault(); s.sendFlag(); }}>
          <span className="text-sm font-semibold">Ask Meridian Payroll</span>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Which line?
            <select
              ref={selectRef}
              value={s.flagLine}
              onChange={(e) => s.setFlagLine(e.target.value)}
              aria-invalid={err}
              aria-describedby={err ? `${id}-err` : undefined}
              className={`min-h-11 rounded-[10px] border bg-white px-3 text-sm font-normal ${err ? 'border-error' : 'border-line-control'}`}
            >
              <option value="">Choose a line</option>
              {pay.flag.lines.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </label>
          {err && <p id={`${id}-err`} className="text-[13px] text-error">Choose the line you’re asking about.</p>}
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Anything to add? (optional)
            <textarea rows={2} value={s.flagNote} onChange={(e) => s.setFlagNote(e.target.value)} placeholder="I thought my bike payments started in May" className="rounded-[10px] border border-line-control px-3 py-2.5 text-sm font-normal" />
          </label>
          <span className="text-xs text-secondary">We’ll attach your April payslip, the line and this explanation.</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="submit" className="min-h-11 rounded-[10px] bg-ink px-4 text-sm font-medium text-white cursor-pointer">Send to payroll</button>
            <button type="button" onClick={() => s.setFlag('closed')} className="min-h-11 px-2 text-sm underline underline-offset-2 cursor-pointer">Cancel</button>
          </div>
        </form>
      )}
      {s.flag === 'sent' && (
        <p role="status" className="flex items-start gap-2.5 text-sm text-success">
          <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white"><Check size={14} /></span>
          <span><strong className="font-semibold">Sent to Meridian Payroll.</strong> {pay.flag.sent}</span>
        </p>
      )}
    </div>
  );
}

