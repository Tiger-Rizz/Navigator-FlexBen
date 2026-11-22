'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CalendarPlus, Check, Lock, Receipt, Sparkles, Undo2, UserRoundSearch, Wallet, X } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/Button';
import { BenefitHeader } from '@/components/pmi/BenefitHeader';
import type { Dependant } from '@/lib/data';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { relationshipLabel, validateDob } from '@/lib/engine/rules';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { coveredPeople, firstName, whoLabel, lowerFirst, leverSummary } from '@/lib/plan';
import { addedPeople, beforeYouConfirm, confirmedSummary, coveredHeadline, nameList } from '@/lib/reviewView';
import { baseline, usePeople, usePersona, usePlan } from '@/lib/store';
import { ChangesTable } from './ChangesTable';
import { PayslipPreview } from './PayslipPreview';
import { Timeline } from './Timeline';

const isoToUk = (iso: string) => iso.split('-').reverse().join('/');

export function ReviewFlow() {
  const { status } = usePlan();
  const confirmed = status !== 'editing';
  return (
    <>
      <div inert={confirmed}><ReviewForm /></div>
      {confirmed && <ConfirmedSheet />}
    </>
  );
}

const WARNING_ICON = { undo: Undo2, excess: Receipt, fund: Wallet, guided: UserRoundSearch } as const;

function ReviewForm() {
  const persona = usePersona();
  const people = usePeople();
  const { selection, dobs, reviewAgreed, setReviewAgreed, confirm } = usePlan();
  const [tried, setTried] = useState(false);
  const b = usePlanPricing(selection);
  const needDob = coveredPeople(selection, people).filter((p) => !p.dob);
  const missing = needDob.filter((p) => !dobs[p.id]);
  const warnings = beforeYouConfirm(baseline, selection, people, persona.taxRate);
  const agreeErr = tried && !reviewAgreed;

  const submit = () => {
    setTried(true);
    if (missing.length === 0 && reviewAgreed) { confirm(); return; }
    // Take the member to the first thing that needs attention.
    const target = missing.length ? document.querySelector<HTMLInputElement>('[data-tour="dependant-details"] input[inputmode="numeric"]') : document.getElementById('agree');
    target?.focus();
  };

  return (
    <>
      <BenefitHeader page="review" />
      <div className="rise relative px-4 pb-24 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <ChangesTable base={baseline} selection={selection} />
            {needDob.map((p) => <DependantDetails key={p.id} person={p} showError={tried} />)}
            <PayslipPreview base={baseline} selection={selection} />
            <section aria-labelledby="before" data-tour="before-confirm" className="flex flex-col gap-3 rounded-[16px] border border-[#F2D9A6] bg-warning-soft px-6 py-[22px]">
              <h2 id="before" className="flex items-center gap-2 text-lg"><AlertTriangle aria-hidden size={18} className="text-warning" />Before you confirm</h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {warnings.map((w) => {
                  const Icon = WARNING_ICON[w.kind];
                  return (
                    <li key={w.kind} className="flex gap-3">
                      <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-warning"><Icon size={16} strokeWidth={1.8} /></span>
                      <p className="text-[13px] leading-relaxed text-ink-2"><strong className="font-semibold text-ink">{w.title.replace(/\.$/, '')}</strong><br />{w.text}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[320px]">
            <section aria-labelledby="confirm-h" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-5 py-5">
              <h2 id="confirm-h" className="text-base">Ready to confirm?</h2>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-secondary">What it really costs you</span>
                <span className="text-[32px] font-semibold leading-tight tracking-tight">{formatMonthly(b.realMonthlyCost)} <span className="text-[15px] font-normal text-secondary">a month</span></span>
                <span className="text-xs text-secondary-2">From 1 April 2027, including tax</span>
              </div>
              {missing.length > 0 && tried && (
                <p className="text-[13px] text-error">Add {nameList(missing)}’s date of birth to confirm.</p>
              )}
              <div className="flex flex-col gap-1.5 border-t border-divider pt-3">
                <label className="flex items-start gap-2.5 text-[13px] leading-snug">
                  <input
                    id="agree"
                    type="checkbox"
                    className="mt-0.5 size-5 shrink-0"
                    checked={reviewAgreed}
                    onChange={(e) => setReviewAgreed(e.target.checked)}
                    aria-invalid={agreeErr}
                    aria-describedby={agreeErr ? 'agree-err' : undefined}
                  />
                  I understand this is guidance, not financial advice, and these choices are mine.
                </label>
                {agreeErr && <p id="agree-err" className="text-[13px] text-error">Tick the box to confirm you’ve read this.</p>}
              </div>
              <Button onClick={submit} data-tour="confirm" className="w-full">Confirm my choices</Button>
              <span className="-mt-1 inline-flex items-center justify-center gap-1.5 text-xs text-secondary"><Lock aria-hidden size={12} />Done here. No AXA login needed.</span>
              <Link href="/benefits/pmi/cover" className="-my-1 inline-flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-secondary no-underline hover:text-ink">
                <ArrowLeft aria-hidden size={15} />Back to your cover
              </Link>
            </section>
            <Timeline base={baseline} selection={selection} people={people} />
          </div>
        </div>
      </div>
    </>
  );
}

function DependantDetails({ person, showError }: { person: Dependant; showError: boolean }) {
  const { dobs, setDob } = usePlan();
  const stored = dobs[person.id];
  const [text, setText] = useState(stored ? isoToUk(stored) : '');
  const [touched, setTouched] = useState(false);
  const id = useId();
  const name = firstName(person);

  useEffect(() => {
    if (stored) setText(isoToUk(stored)); // e.g. filled in by the guided tour
  }, [stored]);

  const check = validateDob(text);
  const error = (showError || touched) && !check.ok
    ? !text.trim() ? `Enter ${name}’s date of birth so AXA can set up his cover.` : check.error === 'future' ? 'Date of birth can’t be in the future.' : 'Enter the date as DD/MM/YYYY.'
    : null;

  return (
    <section aria-labelledby={`${id}-h`} data-tour="dependant-details" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <h2 id={`${id}-h`} className="text-lg">{name}’s details</h2>
      <p className="text-[13px] text-secondary">AXA needs {name}’s date of birth to set up his membership. Everything else comes from your HR record.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          Full name
          <input readOnly value={person.name} className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          Relationship
          <input readOnly value={relationshipLabel(person.relationship).replace(/^./, (c) => c.toUpperCase())} className="min-h-11 rounded-[10px] border border-line bg-surface-2 px-3 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          Date of birth
          <input
            value={text}
            placeholder="DD/MM/YYYY"
            inputMode="numeric"
            onChange={(e) => {
              setText(e.target.value);
              const v = validateDob(e.target.value);
              if (v.ok) setDob(person.id, v.iso);
              else if (stored) setDob(person.id, '');
            }}
            onBlur={() => setTouched(true)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className={`min-h-11 rounded-[10px] border px-3 font-normal ${error ? 'border-error' : 'border-line-control'}`}
          />
        </label>
      </div>
      {error && <p id={`${id}-err`} className="text-[13px] text-error">{error}</p>}
    </section>
  );
}

/** The confirmation slides in over the review page; closing it returns to the benefit page. */
function ConfirmedSheet() {
  const router = useRouter();
  const persona = usePersona();
  const people = usePeople();
  const { confirmedSelection, selection, status, unconfirm, undo } = usePlan();
  const s = confirmedSelection ?? selection;
  const b = usePlanPricing(s);
  const partner = persona.peopleOnRecord.find((p) => p.relationship !== 'child');
  const panelRef = useRef<HTMLElement>(null);
  const close = () => router.push('/benefits/pmi');

  useEffect(() => {
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('h2')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); router.push('/benefits/pmi'); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [router]);

  const calendar = () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Meridian Benefits//EN', 'BEGIN:VEVENT',
      'UID:pmi-cover-2027@meridian-benefits', 'DTSTAMP:20270322T090000Z', 'DTSTART;VALUE=DATE:20270401', 'DTEND;VALUE=DATE:20270402',
      'SUMMARY:AXA Health cover starts', 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'health-cover-starts.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <div aria-hidden onClick={close} className="fade-in absolute inset-0 bg-ink/25 backdrop-blur-[3px]" />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="done"
        data-tour="confirmed"
        className="slide-in relative flex h-full w-full flex-col gap-5 overflow-y-auto bg-white px-6 py-6 shadow-[var(--shadow-float)] sm:w-[500px] sm:px-8"
      >
        <div className="flex items-start justify-between">
          <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success"><Check aria-hidden size={24} /></span>
          <button type="button" aria-label="Close and go to Private Medical Insurance" onClick={close} className="-mr-2 flex size-11 items-center justify-center rounded-[10px] cursor-pointer hover:bg-surface-2">
            <X aria-hidden size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <h2 id="done" tabIndex={-1} className="text-[24px] leading-tight outline-none">{coveredHeadline(s, people)}</h2>
          <p className="text-[15px] leading-relaxed text-ink-2">{confirmedSummary(s, people, persona.taxRate)}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/my-choices" className="flex flex-col gap-1 rounded-[12px] border border-success-border bg-success-banner p-4 no-underline">
            <span className="text-xs font-medium text-success">Saved to My choices</span>
            <span className="font-semibold">Private Medical Insurance</span>
            <span className="text-[13px] text-secondary">{leverSummary(s).split(' · ')[0]}, {lowerFirst(whoLabel(s, people))}, from 1 April 2027</span>
          </Link>
          <Link href="/total-rewards" className="flex flex-col gap-1 rounded-[12px] border border-line p-4 no-underline">
            <span className="text-xs font-medium text-secondary">Updated in Total rewards</span>
            <span className="font-semibold">{formatAnnual(b.employerPays + b.fromFund)} a year towards your health cover</span>
            <span className="text-[13px] text-secondary">{formatAnnual(b.employerPays)} from Meridian, {formatAnnual(b.fromFund)} from your Flex Fund</span>
          </Link>
        </div>
        {partner && (
          <div className="flex gap-3 rounded-[14px] border border-ai-border bg-ai-soft px-4 py-3.5">
            <Sparkles aria-hidden size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
            <div className="flex flex-col gap-1.5 text-sm">
              <p>One more thing: {firstName(partner)} isn’t named on your life assurance. Want to check who should receive it?</p>
              <Link href="/benefits" className="inline-flex min-h-11 items-center self-start font-medium text-ai-text underline underline-offset-2">Review my life assurance</Link>
            </div>
          </div>
        )}
        <div className="mt-auto flex flex-col gap-2.5 border-t border-divider pt-5">
          <Link href="/benefits/pmi" className={buttonClass('primary', 'w-full')}>Back to Private Medical Insurance</Link>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="secondary" onClick={calendar}><CalendarPlus aria-hidden size={16} />Add 1 April to my calendar</Button>
            <button type="button" onClick={() => (status === 'kept' ? undo() : unconfirm())} className="min-h-11 px-2 text-sm underline underline-offset-2 cursor-pointer">Undo</button>
          </div>
        </div>
      </section>
    </div>
  );
}
