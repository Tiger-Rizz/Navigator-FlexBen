'use client';

import Link from 'next/link';
import { Fragment, useEffect, useId, useRef, type ReactNode } from 'react';
import { ArrowUpRight, Camera, Check, Sparkles } from 'lucide-react';
import { allowanceLeft, axaOutcome, claims, inPocketAfterTax, money, type ReceiptId } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';

const btnPrimary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-ink px-[18px] text-sm font-medium text-white cursor-pointer no-underline hover:bg-black';
const btnSecondary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-line-control bg-white px-[18px] text-sm cursor-pointer hover:bg-surface-2';

/** Priya's excess this year: from her confirmed Part 1 plan, defaulting to £250 (PART2.md §4). */
function useExcess() {
  const confirmed = usePlan((s) => s.confirmedSelection);
  return confirmed ? confirmed.excess : 250;
}

export function ClaimIt() {
  const s = usePart2();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5 px-4 pb-16 pt-8 min-[900px]:px-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px]">Claim it</h1>
          <p className="text-[15px] text-ink-2">Add a receipt. Navigator works out which benefit pays, and claims it for you or gets it ready.</p>
        </div>
        {s.receipt && <button type="button" onClick={s.restartClaim} className={btnSecondary} data-tour="claim-restart">Start another claim</button>}
      </div>

      {!s.receipt ? (
        <div data-tour="claim-start" className="flex flex-col gap-5">
          <section aria-label="Add a receipt" className="flex flex-col items-center gap-2.5 rounded-[16px] border border-dashed border-ai-highlight bg-ai-soft px-6 py-9 text-center">
            <span aria-hidden className="flex size-12 items-center justify-center rounded-[12px] bg-ai-bg"><Camera size={20} strokeWidth={1.8} className="text-ai-icon" /></span>
            <span className="text-[17px] font-semibold">Snap or upload a receipt</span>
            <span className="text-[13px] text-secondary">Or describe it, like “new glasses, £189”</span>
            <button type="button" onClick={() => fileRef.current?.click()} className={btnPrimary}>Add a receipt</button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => { if (e.target.files?.length) void s.pickReceipt('glasses'); e.target.value = ''; }}
            />
          </section>
          <section aria-labelledby="samples" className="flex flex-col gap-3">
            <h2 id="samples" className="text-[15px]">Try it with one of Priya’s receipts</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(['glasses', 'physio'] as ReceiptId[]).map((id) => {
                const r = claims.receipts[id];
                return (
                  <button key={id} type="button" onClick={() => void s.pickReceipt(id)} data-tour={`sample-${id}`} className="flex min-h-11 items-center gap-4 rounded-[14px] border border-line bg-white px-[18px] py-4 text-left cursor-pointer hover:border-line-control">
                    <span aria-hidden className="flex h-16 w-[54px] shrink-0 flex-col gap-1 rounded-[6px] border border-line bg-surface-2 p-2">
                      <span className="h-1 w-full rounded bg-line-control" /><span className="h-1 w-3/4 rounded bg-line-control" /><span className="h-1 w-1/2 rounded bg-line-control" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{r.shop}</span>
                      <span className="text-[13px] text-secondary">{r.sampleLine}</span>
                      <span className="text-xs font-medium text-ai-text">{r.sampleRoute}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
          <section aria-labelledby="recent" className="flex flex-col gap-1 rounded-[16px] border border-line px-5 py-4">
            <h2 id="recent" className="pb-2 text-[15px]">Your recent claims</h2>
            <ul className="m-0 flex list-none flex-col p-0">
              {s.recent.map((c, i) => (
                <li key={`${c.what}-${i}`} className="grid grid-cols-1 gap-1 border-t border-divider py-3 text-sm sm:grid-cols-3">
                  <span>{c.what} · {money(c.amount)}</span>
                  <span className="text-secondary">{c.route}</span>
                  <span className="font-medium text-success">{c.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <ReceiptFlow id={s.receipt} />
      )}

      {s.toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-[var(--shadow-float)]">{s.toast}</div>}
      {s.leaving && <LeavingDialog />}
    </div>
  );
}

function ReceiptFlow({ id }: { id: ReceiptId }) {
  const s = usePart2();
  const r = claims.receipts[id];
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <aside aria-label="Your receipt" className="flex w-full flex-col items-center gap-2 lg:w-[300px] lg:shrink-0">
        <div className="w-full rounded-[12px] border border-line bg-[#FAFAF9] px-[18px] py-5 font-mono text-xs text-ink-2">
          <p className="text-center text-[13px] font-bold text-ink">{r.shop}</p>
          <p className="text-center text-secondary">{r.address}</p>
          <div className="my-3 border-t border-dashed border-line-control" />
          <p>{r.date}</p>
          <p className="mt-1.5 flex justify-between"><span>{r.item}</span><span>{money(r.amount)}</span></p>
          <div className="my-3 border-t border-dashed border-line-control" />
          <p className="flex justify-between font-bold text-ink"><span>TOTAL</span><span>{money(r.amount)}</span></p>
          <p className="mt-2 text-secondary">Paid by card ****4417</p>
        </div>
        <span className="text-[11px] text-secondary-2">{r.fileName}</span>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {s.reading ? (
          <section aria-live="polite" className="flex flex-col gap-3 rounded-[16px] border border-line px-5 py-5">
            <span className="flex items-center gap-2 text-[13px] text-ai-text"><Sparkles aria-hidden size={14} strokeWidth={1.8} />Reading your receipt…</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-11 animate-pulse rounded-[10px] bg-surface-2" />)}
            </div>
          </section>
        ) : (
          <>
            <ReadFields id={id} />
            {r.route === 'allowance' ? <AllowanceRoute id={id} /> : <AxaRoute id={id} />}
          </>
        )}
      </div>
    </div>
  );
}

function ReadFields({ id }: { id: ReceiptId }) {
  const r = claims.receipts[id];
  const fields: [string, string][] = [['Provider', r.shop], ['Date', r.dateShort], ['What for', r.what], ['Amount', money(r.amount)]];
  return (
    <section aria-label="Details read from your receipt" data-tour="claim-fields" className="flex flex-col gap-3 rounded-[16px] border border-line px-5 py-4">
      <span className="flex items-center gap-2 text-[13px] text-ai-text"><Sparkles aria-hidden size={14} strokeWidth={1.8} />Read from your receipt. Check it’s right.</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map(([label, value]) => (
          <label key={label} className="flex flex-col gap-1.5 text-xs text-secondary">
            {label}
            <input defaultValue={value} className="min-h-11 rounded-[10px] border border-line-control px-3 text-sm text-ink" />
          </label>
        ))}
      </div>
    </section>
  );
}

function RouteHeader({ tile, title, children }: { tile: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3.5">
      {tile}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ai-text">Best route</span>
        <h2 className="text-lg">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-2">{children}</p>
      </div>
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
      <section aria-label="Best route" data-tour="claim-route" className="flex flex-col gap-4 rounded-[16px] border border-ai-border bg-ai-soft px-5 py-5">
        <RouteHeader tile={<span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint font-semibold text-brand">£</span>} title={`${claims.allowance.name} pays this`}>
          Glasses aren’t covered by your AXA plan on Core, but eye care is on Meridian’s allowance list. You have {money(left).replace('.00', '')} left this year, so this fits.
        </RouteHeader>
        <dl className="m-0 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[['Allowance left after this', money(after)], ['Paid with your salary', claims.allowance.paidWithSalary], ['In your pocket, after tax', money(pocket)]].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 rounded-[12px] border border-line bg-white px-4 py-3">
              <dt className="text-xs text-secondary">{k}</dt>
              <dd className="m-0 text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-secondary">Allowance payments are taxed like salary, at your 40% rate plus 2% National Insurance. Source: {claims.allowance.rulesSource}.</p>
        {!s.submitted && (
          <form className="flex flex-col gap-2" noValidate onSubmit={(e) => { e.preventDefault(); s.submitClaim(); }}>
            <label className="flex min-h-11 items-center gap-2.5 text-sm">
              <input type="checkbox" className="size-5 shrink-0" checked={s.own} onChange={(e) => s.setOwn(e.target.checked)} aria-invalid={err} aria-describedby={err ? checkId : undefined} />
              This was for me, and I haven’t claimed it anywhere else.
            </label>
            {err && <p id={checkId} className="text-[13px] text-error">Tick the box to confirm before you submit.</p>}
            <div><button type="submit" className={btnPrimary} data-tour="claim-submit">Submit claim · {money(r.amount)}</button></div>
          </form>
        )}
      </section>
      {s.submitted && (
        <section role="status" aria-label="Claim status" data-tour="claim-status" className="flex flex-col gap-3 rounded-[16px] border border-success-border bg-success-banner px-5 py-5">
          <p className="font-semibold text-success">Claim approved. {money(r.amount)} will be paid with your May salary.</p>
          <ol className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
            <Step done label="Submitted" detail="just now" />
            <Step done label="Approved automatically" detail="it meets Meridian’s allowance rules" />
            <Step label="Paid with your salary" detail={claims.allowance.paidWithSalary} />
          </ol>
          <Link href="/pay" className="inline-flex min-h-11 items-center self-start text-sm font-medium text-ai-text underline underline-offset-2">It’ll show on your May payslip, explained in Your pay →</Link>
        </section>
      )}
    </>
  );
}

function Step({ done, label, detail }: { done?: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span aria-hidden className={`flex size-6 items-center justify-center rounded-full ${done ? 'bg-success text-white' : 'border-2 border-success-border bg-white'}`}>{done && <Check size={14} />}</span>
      <span>{label} <span className="text-secondary">· {detail}</span></span>
      <span className="sr-only">{done ? '(done)' : '(pending)'}</span>
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
      <section aria-label="Best route" data-tour="claim-axa" className="flex flex-col gap-4 rounded-[16px] border border-ai-border bg-ai-soft px-5 py-5">
        <RouteHeader tile={<span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-axa text-[11px] font-bold text-white">AXA</span>} title="Your AXA health cover handles this one">
          {out.axaPays === 0 ? (
            <>Physio is covered on your plan, but AXA runs its own claims, so you’ll finish on AXA’s site. One thing first: you chose a <strong className="font-semibold">{money(excess).replace('.00', '')} excess</strong>, so AXA won’t pay out on this {money(r.amount).replace('.00', '')} invoice. Claiming it still counts towards your excess, so a later claim this year costs you less.</>
          ) : out.towardsExcess === 0 ? (
            <>Physio is covered on your plan, but AXA runs its own claims, so you’ll finish on AXA’s site. You have no excess to pay, so AXA should pay this {money(r.amount).replace('.00', '')} invoice in full.</>
          ) : (
            <>Physio is covered on your plan, but AXA runs its own claims, so you’ll finish on AXA’s site. The first {money(out.towardsExcess).replace('.00', '')} goes towards your excess, so AXA should pay {money(out.axaPays)}.</>
          )}
        </RouteHeader>
        <p className="flex items-start gap-2 rounded-[12px] border border-line bg-white px-4 py-3 text-[13px]">
          <Sparkles aria-hidden size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
          Next time, start through AXA’s Muscles, Bones and Joints service. No GP referral is needed, and AXA arranges and pays the physio directly.
        </p>
        {!s.submitted && (
          <>
            <div className="flex flex-col gap-1.5 rounded-[12px] border border-line bg-white px-4 py-3 text-[13px]">
              <span className="pb-1 font-semibold">Ready for AXA</span>
              <dl className="m-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-x-4 gap-y-1.5">
                {details.map(([k, v]) => (<Fragment key={k}><dt className="text-secondary">{k}</dt><dd className="m-0">{v}</dd></Fragment>))}
              </dl>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={() => s.setLeaving(true)} className={btnPrimary} data-tour="claim-continue">Continue on AXA’s site <ArrowUpRight aria-hidden size={15} /></button>
              <button type="button" onClick={copy} className={btnSecondary}>Copy details</button>
            </div>
          </>
        )}
      </section>
      {s.submitted && (
        <section role="status" aria-label="Claim status" data-tour="claim-handed" className="flex flex-col gap-1.5 rounded-[16px] border border-line bg-white px-5 py-4">
          <p className="font-semibold">Handed to AXA with your details filled in</p>
          <p className="text-sm text-ink-2">
            We’ll check in on {axa.checkIn} to see if AXA has confirmed it.
            {out.towardsExcess > 0 ? ` ${money(out.towardsExcess).replace('.00', '')} of your ${money(excess).replace('.00', '')} excess will then be used for this year.` : ''}
          </p>
        </section>
      )}
    </>
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
    <dialog ref={ref} aria-labelledby="leaving" onCancel={() => s.setLeaving(false)} className="m-auto w-[min(440px,calc(100%-2rem))] rounded-[16px] border border-line p-0 backdrop:bg-black/40">
      <div className="flex flex-col gap-3 px-6 py-5">
        <span aria-hidden className="flex size-10 items-center justify-center rounded-[10px] bg-axa text-[11px] font-bold text-white">AXA</span>
        <h2 id="leaving" className="text-lg">You’re leaving Meridian Benefits for AXA Health</h2>
        <p className="text-sm text-ink-2">Your claim details are filled in on AXA’s side. This prototype doesn’t open a real AXA page.</p>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" autoFocus onClick={s.handOff} className={btnPrimary}>Continue to AXA</button>
          <button type="button" onClick={() => s.setLeaving(false)} className={btnSecondary}>Stay here</button>
        </div>
      </div>
    </dialog>
  );
}
