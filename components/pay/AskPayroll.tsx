'use client';

import { useEffect, useId, useRef } from 'react';
import { Check, MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { pay } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';

function PayrollAvatar() {
  return (
    <span aria-hidden className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
      MP
      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#2E8A5E]" />
    </span>
  );
}

/** A question to payroll that arrives with the payslip and the explanation, so nobody starts from scratch. */
export function AskPayroll() {
  const s = usePart2();
  const id = useId();
  const firstRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (s.flag === 'open') firstRef.current?.focus({ preventScroll: true });
  }, [s.flag]);
  const err = s.flagTried && !s.flagLine;
  const lineLabel = pay.flag.lines.find((l) => l.value === s.flagLine)?.label;
  const close = () => { s.setFlag('closed'); requestAnimationFrame(() => openerRef.current?.focus()); };

  return (
    <section aria-labelledby={`${id}-h`} data-tour="pay-flag" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <PayrollAvatar />
        <div className="flex min-w-[180px] flex-1 flex-col">
          <h2 id={`${id}-h`} className="text-base font-semibold">{s.flag === 'closed' ? 'Something look wrong?' : 'Meridian Payroll'}</h2>
          <span className="text-[13px] text-secondary">
            {s.flag === 'closed' ? 'Ask payroll. Your payslip and this explanation go with your question.' : 'Usually replies within 2 working days'}
          </span>
        </div>
        {s.flag === 'closed' && (
          <Button ref={openerRef} variant="secondary" className="max-sm:w-full" onClick={() => s.setFlag('open')}><MessageCircle aria-hidden size={16} />Ask payroll</Button>
        )}
        {s.flag === 'open' && (
          <button type="button" aria-label="Cancel" onClick={close} className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-secondary cursor-pointer hover:bg-surface-2 hover:text-ink"><X aria-hidden size={18} /></button>
        )}
      </div>

      {s.flag === 'open' && (
        <form className="fade-in flex flex-col gap-4" noValidate onSubmit={(e) => { e.preventDefault(); if (!s.sendFlag()) firstRef.current?.focus(); }}>
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" aria-describedby={err ? `${id}-err` : undefined}>
            <legend className="mb-2 text-[13px] font-medium">What’s it about?</legend>
            <div className="flex flex-wrap gap-2">
              {pay.flag.lines.map((l, i) => (
                <label
                  key={l.value}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm cursor-pointer transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ai-icon ${s.flagLine === l.value ? 'border-ink bg-ink font-medium text-white' : err ? 'border-error bg-white hover:bg-surface-2' : 'border-line-control bg-white hover:bg-surface-2'}`}
                >
                  <input
                    ref={i === 0 ? firstRef : undefined}
                    type="radio"
                    name={`${id}-line`}
                    value={l.value}
                    checked={s.flagLine === l.value}
                    onChange={() => s.setFlagLine(l.value)}
                    className="sr-only"
                  />
                  {s.flagLine === l.value && <Check aria-hidden size={14} strokeWidth={2.5} />}
                  {l.label}
                </label>
              ))}
            </div>
            {err && <p id={`${id}-err`} className="text-[13px] text-error">Choose the line you’re asking about.</p>}
          </fieldset>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Add a note <span className="sr-only">(optional)</span>
            <textarea
              rows={2}
              value={s.flagNote}
              onChange={(e) => s.setFlagNote(e.target.value)}
              placeholder="Optional, like “I thought my bike payments started in May”"
              className="resize-none rounded-[12px] border border-line-control bg-white px-3.5 py-3 text-sm font-normal"
            />
          </label>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-secondary">
            <span className="mr-0.5">Sent with it:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1"><Paperclip aria-hidden size={12} />April 2027 payslip</span>
            {lineLabel && <span className="fade-in inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1"><Paperclip aria-hidden size={12} />{lineLabel}, explained</span>}
          </div>
          <div>
            <Button type="submit"><Send aria-hidden size={15} />Send to payroll</Button>
          </div>
        </form>
      )}

      {s.flag === 'sent' && (
        <div className="fade-in flex flex-col gap-3">
          <div className="flex flex-col items-end gap-1.5 self-end sm:max-w-[80%]">
            <div className="flex flex-col gap-1 rounded-[16px] rounded-br-[6px] bg-ink px-4 py-3 text-sm text-white">
              <span className="text-xs text-white/70">About: {lineLabel}</span>
              <p>{s.flagNote.trim() || 'Could you check this line on my April payslip?'}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-secondary-2"><Paperclip aria-hidden size={12} />Payslip and explanation attached</span>
          </div>
          <p role="status" className="flex items-start gap-2.5 rounded-[12px] bg-success-banner px-3.5 py-3 text-sm text-success">
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white"><Check size={12} strokeWidth={3} /></span>
            <span><strong className="font-semibold">Sent to Meridian Payroll.</strong> {pay.flag.sent}</span>
          </p>
          <button type="button" onClick={close} className="inline-flex min-h-11 items-center self-start px-1 text-sm text-secondary underline underline-offset-2 cursor-pointer hover:text-ink">Ask about something else</button>
        </div>
      )}
    </section>
  );
}
