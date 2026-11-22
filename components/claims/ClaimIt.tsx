'use client';

import Link from 'next/link';
import { Fragment, useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, ChevronRight, Copy, Plus, ScanLine, Sparkles } from 'lucide-react';
import { AxaTile } from '@/components/pmi/BenefitHeader';
import { Button } from '@/components/ui/Button';
import { allowanceLeft, axaOutcome, claims, inPocketAfterTax, money, type ReceiptId } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';
import { ReceiptPaper } from './ReceiptPaper';

const pounds = (n: number) => money(n).replace('.00', '');

/** Priya's excess this year: from her confirmed Part 1 plan, defaulting to £250 (PART2.md §4). */
function useExcess() {
  const confirmed = usePlan((s) => s.confirmedSelection);
  return confirmed ? confirmed.excess : 250;
}

function AllowanceTile({ size = 40 }: { size?: number }) {
  return (
    <span aria-hidden style={{ width: size, height: size, fontSize: size < 30 ? 11 : 16 }} className="flex shrink-0 items-center justify-center rounded-[10px] bg-brand-tint font-semibold text-brand">£</span>
  );
}

export function ClaimIt() {
  const s = usePart2();
  return (
    <>
      <ClaimsHeader />
      <div className="rise relative px-4 pb-24 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start">
          {!s.receipt ? (
            <>
              <div data-tour="claim-start" className="flex min-w-0 flex-1 flex-col gap-5">
                <ScanCard />
                <Samples />
              </div>
              <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[340px]">
                <AllowanceCard />
              </div>
            </>
          ) : (
            <ReceiptFlow id={s.receipt} />
          )}
        </div>
      </div>
      {s.toast && <div role="status" className="fade-in fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-[var(--shadow-float)]">{s.toast}</div>}
      {s.leaving && <LeavingDialog />}
    </>
  );
}

/** Same band as the benefit pages. */
function ClaimsHeader() {
  const s = usePart2();
  const left = allowanceLeft(claims.allowance.annual, s.recent);
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
            <li aria-current="page" className="text-ink">Claims</li>
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-[12px] bg-brand text-white"><ScanLine size={28} strokeWidth={1.8} /></span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-secondary">Wellbeing Allowance and AXA Health</span>
            <h1 className="text-[28px]">Claim it</h1>
          </div>
          {s.receipt ? (
            <Button variant="secondary" className="sm:ml-auto" onClick={s.restartClaim} data-tour="claim-restart"><Plus aria-hidden size={16} />Start another claim</Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success-border bg-white px-3 py-1 text-xs font-medium text-success sm:ml-auto">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {pounds(left)} left in your allowance
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Start ----

function ScanCard() {
  const s = usePart2();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const id = useId();
  // A described claim maps to the matching demo receipt (PART2.md §4: the demo always uses Priya's receipts).
  const describe = () => {
    if (!text.trim()) return;
    void s.pickReceipt(/physio|osteo|clinic|massage|back|knee/i.test(text) ? 'physio' : 'glasses');
    setText('');
  };
  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col items-center gap-5 rounded-[16px] border border-line bg-white px-6 pb-7 pt-8 text-center">
      <div aria-hidden className="relative px-4 py-4">
        <span className="absolute left-0 top-0 size-5 rounded-tl-[8px] border-l-2 border-t-2 border-ai-icon" />
        <span className="absolute right-0 top-0 size-5 rounded-tr-[8px] border-r-2 border-t-2 border-ai-icon" />
        <span className="absolute bottom-0 left-0 size-5 rounded-bl-[8px] border-b-2 border-l-2 border-ai-icon" />
        <span className="absolute bottom-0 right-0 size-5 rounded-br-[8px] border-b-2 border-r-2 border-ai-icon" />
        <div className="relative w-[112px] rotate-[-4deg] drop-shadow-[0_8px_18px_rgba(20,20,20,0.10)]">
          <div className="receipt-edge flex flex-col gap-1.5 bg-white px-3.5 pb-7 pt-4">
            <span className="mx-auto h-1.5 w-14 rounded bg-ink/75" />
            <span className="mx-auto h-1 w-10 rounded bg-line-control" />
            <span className="mt-1.5 h-1 w-full rounded bg-line-control" />
            <span className="h-1 w-4/5 rounded bg-line-control" />
            <span className="h-1 w-3/5 rounded bg-line-control" />
            <span className="mt-1.5 flex justify-between"><span className="h-1.5 w-8 rounded bg-ink/60" /><span className="h-1.5 w-7 rounded bg-ink/60" /></span>
          </div>
          <span className="absolute inset-0 overflow-hidden">
            <span className="scan-loop absolute inset-x-0 h-0.5 bg-ai-icon shadow-[0_0_12px_3px_rgba(91,69,214,0.4)]" />
          </span>
        </div>
        <span className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full border border-ai-border bg-ai-bg"><Sparkles size={16} strokeWidth={1.8} className="text-ai-icon" /></span>
      </div>
      <div className="flex max-w-[440px] flex-col gap-1.5">
        <h2 id={`${id}-h`} className="text-[22px] leading-snug">Snap a receipt. Navigator does the rest.</h2>
        <p className="text-[15px] text-ink-2">It reads it, finds the benefit that pays, and claims it for you.</p>
      </div>
      <Button onClick={() => fileRef.current?.click()}><Camera aria-hidden size={16} />Take a photo or upload</Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => { if (e.target.files?.length) void s.pickReceipt('glasses'); e.target.value = ''; }}
      />
      <form className="flex w-full max-w-[400px] items-center gap-2 rounded-full border border-line-control bg-white py-1 pl-4 pr-1 focus-within:border-ai-icon" onSubmit={(e) => { e.preventDefault(); describe(); }}>
        <label htmlFor={`${id}-describe`} className="sr-only">Or describe it</label>
        <input
          id={`${id}-describe`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or describe it: new glasses, £189"
          className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-secondary-2"
          autoComplete="off"
        />
        <button type="submit" aria-label="Claim it" disabled={!text.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white cursor-pointer disabled:cursor-default disabled:bg-line-control">
          <ArrowRight aria-hidden size={16} />
        </button>
      </form>
    </section>
  );
}

function Samples() {
  const s = usePart2();
  return (
    <section aria-labelledby="samples" className="flex flex-col gap-3">
      <h2 id="samples" className="text-[15px] font-semibold">Or try one of Priya’s receipts</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(['glasses', 'physio'] as ReceiptId[]).map((id) => {
          const r = claims.receipts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => void s.pickReceipt(id)}
              data-tour={`sample-${id}`}
              className="group flex min-h-11 items-center gap-4 rounded-[16px] border border-line bg-white px-5 py-4 text-left cursor-pointer transition-colors hover:border-line-control hover:bg-[#FAFAF9]"
            >
              <ReceiptPaper id={id} reading={false} size="thumb" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold leading-snug">{r.shop}</span>
                <span className="text-[13px] text-secondary">{r.sampleLine}</span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-full bg-surface-2 py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-ink-2">
                  {r.route === 'axa' ? <AxaTile size={18} /> : <AllowanceTile size={18} />}
                  {r.sampleRoute}
                </span>
              </span>
              <ChevronRight aria-hidden size={16} className="shrink-0 text-secondary-2 transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AllowanceCard() {
  const s = usePart2();
  const left = allowanceLeft(claims.allowance.annual, s.recent);
  return (
    <section aria-labelledby="allowance-h" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-5 py-5">
      <div className="flex items-center gap-3">
        <AllowanceTile />
        <div className="flex flex-col">
          <h2 id="allowance-h" className="text-base font-semibold">{claims.allowance.short}</h2>
          <span className="text-xs text-secondary-2">From Meridian · paid with your salary</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="flex items-baseline gap-1.5"><span className="text-[28px] font-semibold leading-none tracking-tight">{money(left)}</span><span className="text-sm text-secondary">left of {pounds(claims.allowance.annual)}</span></p>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`${money(left)} of ${pounds(claims.allowance.annual)} left`}>
          <div className="h-full rounded-full bg-fund" style={{ width: `${(left / claims.allowance.annual) * 100}%` }} />
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="pb-1 text-[13px] font-medium text-secondary">Recent claims</h3>
        <ul className="m-0 flex list-none flex-col p-0">
          {s.recent.map((c, i) => (
            <li key={`${c.what}-${i}`} className="flex items-center gap-3 border-t border-divider py-2.5 first:border-t-0">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-bg text-success"><Check size={14} strokeWidth={2.5} /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{c.what}</span>
                <span className="text-xs text-secondary-2">{c.status}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums">{money(c.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---- A receipt ----

function ReceiptFlow({ id }: { id: ReceiptId }) {
  const s = usePart2();
  const r = claims.receipts[id];
  return (
    <>
      <div className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[340px]">
        <section aria-label="Your receipt" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white p-4">
          <div className="rounded-[12px] bg-surface-2 py-4">
            <ReceiptPaper id={id} reading={s.reading} />
          </div>
          <div className="flex items-center justify-between gap-2 px-1 text-xs">
            <span className="truncate text-secondary-2">{r.fileName}</span>
            <span role="status" className="shrink-0">
              {s.reading ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-ai-text"><Sparkles aria-hidden size={13} strokeWidth={1.8} />Reading your receipt…</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-medium text-success"><Check aria-hidden size={13} strokeWidth={2.5} />4 details found</span>
              )}
            </span>
          </div>
        </section>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {s.reading ? (
          <Reading id={id} />
        ) : (
          <>
            <ReadFields id={id} />
            {r.route === 'allowance' ? <AllowanceRoute id={id} /> : <AxaRoute id={id} />}
          </>
        )}
      </div>
    </>
  );
}

/** What Navigator is doing while it reads, one line at a time. */
function Reading({ id }: { id: ReceiptId }) {
  const r = claims.receipts[id];
  const steps = [`Found the shop: ${r.shop}`, `Dated ${r.dateShort}`, `For ${r.what.toLowerCase()}, ${money(r.amount)}`, 'Checking which benefit pays'];
  return (
    <section aria-label="Reading your receipt" className="flex flex-col gap-3 rounded-[16px] border border-ai-border bg-ai-soft px-5 py-5">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ai-text"><Sparkles aria-hidden size={14} strokeWidth={1.8} className="text-ai-icon" />Reading your receipt</span>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {steps.map((t, i) => (
          <li key={t} className="pop flex items-center gap-2.5 text-sm" style={{ animationDelay: `${150 + i * 300}ms` }}>
            {i < steps.length - 1 ? (
              <span aria-hidden className="flex size-5 items-center justify-center rounded-full bg-ai-icon text-white"><Check size={12} strokeWidth={3} /></span>
            ) : (
              <span aria-hidden className="flex size-5 items-center justify-center"><span className="size-2 animate-pulse rounded-full bg-ai-icon" /></span>
            )}
            {t}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReadFields({ id }: { id: ReceiptId }) {
  const r = claims.receipts[id];
  const fields: [string, string][] = [['Provider', r.shop], ['Date', r.dateShort], ['What for', r.what], ['Amount', money(r.amount)]];
  return (
    <section aria-labelledby="fields-h" data-tour="claim-fields" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="fields-h" className="text-base font-semibold">Read from your receipt</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-bg px-2.5 py-1 text-xs font-medium text-ai-text"><Sparkles aria-hidden size={12} strokeWidth={1.8} />Check it’s right</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(([label, value], i) => (
          <label key={label} className="pop flex flex-col gap-1.5 text-xs font-medium text-secondary" style={{ animationDelay: `${i * 80}ms` }}>
            {label}
            <input defaultValue={value} className="min-h-11 rounded-[10px] border border-line-control bg-white px-3 text-sm font-normal text-ink" />
          </label>
        ))}
      </div>
    </section>
  );
}

/** Which benefit pays, shown as a choice Navigator made between the two. */
function RoutePicker({ chosen, reasons }: { chosen: 'allowance' | 'axa'; reasons: Record<'allowance' | 'axa', string> }) {
  const options = [
    { id: 'allowance' as const, name: claims.allowance.short, tile: <AllowanceTile size={32} /> },
    { id: 'axa' as const, name: 'AXA Health', tile: <AxaTile size={32} /> },
  ];
  return (
    <ul aria-label="Which benefit pays" className="m-0 grid list-none grid-cols-2 gap-3 p-0">
      {options.map((o) => {
        const on = o.id === chosen;
        return (
          <li key={o.id} className={`relative flex flex-col gap-2 rounded-[12px] border p-3.5 ${on ? 'border-brand bg-white ring-1 ring-brand' : 'border-line bg-[#FAFAF9]'}`}>
            <div className="flex items-center justify-between">
              <span className={on ? '' : 'grayscale opacity-60'}>{o.tile}</span>
              {on ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[11px] font-semibold text-success"><Check aria-hidden size={11} strokeWidth={3} />Pays this</span>
              ) : (
                <span className="text-[11px] font-medium text-secondary">Not this time</span>
              )}
            </div>
            <span className={`text-sm font-semibold ${on ? '' : 'text-secondary'}`}>{o.name}</span>
            <span className="text-xs text-secondary">{reasons[o.id]}</span>
          </li>
        );
      })}
    </ul>
  );
}

function RouteHead({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ai-text"><Sparkles aria-hidden size={13} strokeWidth={1.8} className="text-ai-icon" />Best route</span>
      <h2 className="text-lg leading-snug">{title}</h2>
    </div>
  );
}

function AllowanceRoute({ id }: { id: ReceiptId }) {
  const s = usePart2();
  const r = claims.receipts[id];
  const checkId = useId();
  const claimedBefore = s.submitted ? s.recent.slice(1) : s.recent;
  const left = allowanceLeft(claims.allowance.annual, claimedBefore);
  const after = allowanceLeft(claims.allowance.annual, [...claimedBefore, { amount: r.amount }]);
  const pocket = inPocketAfterTax(r.amount);
  const err = s.ownTried && !s.own;

  return (
    <>
      <section aria-label="Best route" data-tour="claim-route" className="flex flex-col gap-5 rounded-[16px] border border-line bg-white px-5 py-5">
        <RouteHead title={`Your ${claims.allowance.short} pays this`} />
        <RoutePicker chosen="allowance" reasons={{ allowance: `Eye care is on the list. ${pounds(left)} left`, axa: 'Glasses aren’t covered on Core' }} />
        <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 rounded-[12px] bg-[#FAFAF9] px-4 py-3">
            <dt className="text-xs text-secondary">Allowance left after this</dt>
            <dd className="m-0 text-lg font-semibold tabular-nums">{money(after)}</dd>
            <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-fund" style={{ width: `${(after / claims.allowance.annual) * 100}%` }} /></span>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[12px] bg-[#FAFAF9] px-4 py-3">
            <dt className="text-xs text-secondary">Paid with your salary</dt>
            <dd className="m-0 text-lg font-semibold">{claims.allowance.paidWithSalary}</dd>
          </div>
          <div className="flex flex-col gap-1.5 rounded-[12px] bg-[#FAFAF9] px-4 py-3">
            <dt className="text-xs text-secondary">In your pocket, after tax</dt>
            <dd className="m-0 text-lg font-semibold tabular-nums">{money(pocket)}</dd>
          </div>
        </dl>
        <p className="-mt-2 text-xs text-secondary-2">Taxed like salary: 40% plus 2% National Insurance. Source: {claims.allowance.rulesSource}.</p>
        {!s.submitted && (
          <form className="flex flex-col gap-3 border-t border-divider pt-4" noValidate onSubmit={(e) => { e.preventDefault(); s.submitClaim(); }}>
            <label className="flex min-h-11 items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-5 shrink-0" checked={s.own} onChange={(e) => s.setOwn(e.target.checked)} aria-invalid={err} aria-describedby={err ? checkId : undefined} />
              This was for me, and I haven’t claimed it anywhere else.
            </label>
            {err && <p id={checkId} className="text-[13px] text-error">Tick the box to confirm before you submit.</p>}
            <div><Button type="submit" data-tour="claim-submit">Submit claim · {money(r.amount)}</Button></div>
          </form>
        )}
      </section>
      {s.submitted && (
        <section role="status" aria-labelledby="claim-done" data-tour="claim-status" className="pop flex flex-col gap-4 rounded-[16px] border border-success-border bg-success-banner px-5 py-5">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-white"><Check size={20} strokeWidth={2.5} /></span>
            <h2 id="claim-done" className="text-base leading-snug">Claim approved. {money(r.amount)} will be paid with your May salary.</h2>
          </div>
          <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0 text-xs">
            <Step done label="Submitted" detail="Just now" />
            <Step done label="Approved automatically" detail="Meets the allowance rules" />
            <Step label="Paid with your salary" detail={claims.allowance.paidWithSalary} last />
          </ol>
          <Link href="/pay" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-success underline underline-offset-2">It’ll show on your May payslip, explained in My pay<ArrowRight aria-hidden size={14} /></Link>
        </section>
      )}
    </>
  );
}

function Step({ done, label, detail, last }: { done?: boolean; label: string; detail: string; last?: boolean }) {
  return (
    <li className="relative flex flex-col gap-1.5">
      {!last && <span aria-hidden className={`absolute left-6 right-0 top-[11px] h-0.5 ${done ? 'bg-success' : 'bg-success-border'}`} />}
      <span aria-hidden className={`relative flex size-6 items-center justify-center rounded-full ${done ? 'bg-success text-white' : 'border-2 border-success-border bg-white'}`}>{done && <Check size={13} strokeWidth={3} />}</span>
      <span className="pr-2 font-semibold text-ink">{label}<span className="sr-only">{done ? ', done' : ', to come'}</span></span>
      <span className="text-secondary">{detail}</span>
    </li>
  );
}

function AxaRoute({ id }: { id: ReceiptId }) {
  const s = usePart2();
  const r = claims.receipts[id];
  const axa = r.axa!;
  const excess = useExcess();
  const out = axaOutcome(r.amount, excess);
  const details: [string, string][] = [['Membership number', axa.membership], ['Patient', axa.patient], ['Treatment', axa.treatment], ['Invoice', `Attached · ${money(r.amount)}`]];

  const copy = async () => {
    const textToCopy = details.map(([k, v]) => `${k}: ${v}`).join('\n');
    try { await navigator.clipboard.writeText(textToCopy); } catch { /* clipboard may be blocked; the toast still confirms the action */ }
    s.showToast('Copied');
  };

  return (
    <>
      <section aria-label="Best route" data-tour="claim-axa" className="flex flex-col gap-5 rounded-[16px] border border-line bg-white px-5 py-5">
        <RouteHead title="Your AXA health cover handles this one" />
        <RoutePicker chosen="axa" reasons={{ allowance: 'Treatment goes to your health cover', axa: 'Physio is covered. You finish on AXA’s site' }} />
        <ExcessMeter amount={r.amount} excess={excess} />
        <p className="flex items-start gap-2 rounded-[12px] border border-ai-border bg-ai-soft px-4 py-3 text-[13px]">
          <Sparkles aria-hidden size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
          Next time, start with AXA’s Muscles, Bones and Joints service. No GP referral, and AXA pays the physio directly.
        </p>
        {!s.submitted && (
          <div className="flex flex-col gap-4 border-t border-divider pt-4">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold"><Check aria-hidden size={15} strokeWidth={2.5} className="text-success" />Ready for AXA</span>
              <dl className="m-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-x-4 gap-y-1.5 rounded-[12px] bg-[#FAFAF9] px-4 py-3 text-[13px]">
                {details.map(([k, v]) => (<Fragment key={k}><dt className="text-secondary">{k}</dt><dd className="m-0 font-medium">{v}</dd></Fragment>))}
              </dl>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => s.setLeaving(true)} data-tour="claim-continue">Continue on AXA’s site<ArrowUpRight aria-hidden size={15} /></Button>
              <Button variant="secondary" onClick={copy}><Copy aria-hidden size={15} />Copy details</Button>
            </div>
          </div>
        )}
      </section>
      {s.submitted && (
        <section role="status" aria-labelledby="handed" data-tour="claim-handed" className="pop flex gap-4 rounded-[16px] border border-line bg-white px-5 py-5">
          <span className="relative h-fit">
            <AxaTile size={44} />
            <span aria-hidden className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-success text-white"><Check size={11} strokeWidth={3} /></span>
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="handed" className="text-base">Handed to AXA with your details filled in</h2>
            <p className="text-sm text-ink-2">
              We’ll check in on {axa.checkIn} to see if AXA has confirmed it.
              {out.towardsExcess > 0 ? ` ${pounds(out.towardsExcess)} of your ${pounds(excess)} excess will then be used for this year.` : ''}
            </p>
          </div>
        </section>
      )}
    </>
  );
}

/** What AXA pays on this invoice, and how much of the excess it uses. */
function ExcessMeter({ amount, excess }: { amount: number; excess: number }) {
  const out = axaOutcome(amount, excess);
  if (excess === 0) {
    return (
      <div className="flex items-baseline justify-between gap-3 rounded-[12px] bg-[#FAFAF9] px-4 py-3.5">
        <span className="text-[13px] text-secondary">AXA pays, with no excess to pay</span>
        <span className="text-[22px] font-semibold tabular-nums">{money(out.axaPays)}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-[12px] bg-[#FAFAF9] px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[13px] text-secondary">AXA pays on this invoice</span>
        <span className="text-[22px] font-semibold tabular-nums">{money(out.axaPays)}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${pounds(out.towardsExcess)} of your ${pounds(excess)} excess used, ${pounds(out.excessLeft)} to go`}>
          <span className="h-full rounded-full bg-brand" style={{ width: `${(out.towardsExcess / excess) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-secondary">
          <span><span className="font-semibold text-ink">{pounds(out.towardsExcess)}</span> of your {pounds(excess)} excess</span>
          <span>{pounds(out.excessLeft)} to go</span>
        </div>
      </div>
      <p className="text-[13px] text-ink-2">
        {out.axaPays === 0
          ? `You chose a ${pounds(excess)} excess, so AXA won’t pay out on this ${pounds(amount)} invoice. Claiming still counts towards it, so a later claim costs you less.`
          : `The first ${pounds(out.towardsExcess)} goes towards your excess.`}
      </p>
    </div>
  );
}

function LeavingDialog() {
  const s = usePart2();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="leaving" onCancel={() => s.setLeaving(false)} className="m-auto w-[min(440px,calc(100%-2rem))] rounded-[16px] border border-line p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[3px]">
      <div className="flex flex-col gap-4 px-6 py-6">
        <div className="flex items-center gap-2">
          <span aria-hidden className="flex size-10 items-center justify-center rounded-[10px] bg-brand text-white"><ScanLine size={18} strokeWidth={1.8} /></span>
          <ArrowRight aria-hidden size={16} className="text-secondary-2" />
          <AxaTile size={40} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 id="leaving" className="text-lg">You’re leaving Meridian Benefits for AXA Health</h2>
          <p className="text-sm text-ink-2">Your claim details are filled in on AXA’s side. This prototype doesn’t open a real AXA page.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button autoFocus onClick={s.handOff}>Continue to AXA</Button>
          <Button variant="secondary" onClick={() => s.setLeaving(false)}>Stay here</Button>
        </div>
      </div>
    </dialog>
  );
}

