'use client';

import type { ReactNode } from 'react';
import { claims, money, type ReceiptId } from '@/lib/part2';

/** A detail Navigator read: lights up on the paper once the scan has passed it. */
function Found({ on, delay, children }: { on: boolean; delay: number; children: ReactNode }) {
  if (!on) return <span>{children}</span>;
  return (
    <span className="pop -mx-1 rounded-[4px] bg-ai-bg px-1 text-ink outline outline-1 outline-ai-highlight" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </span>
  );
}

/**
 * The receipt as a piece of paper. While `reading`, a scan line sweeps down it inside a scan frame;
 * afterwards the four details Navigator read are highlighted in place.
 */
export function ReceiptPaper({ id, reading, size = 'large' }: { id: ReceiptId; reading: boolean; size?: 'large' | 'thumb' }) {
  const r = claims.receipts[id];
  const found = !reading && size === 'large';
  const [date, time] = r.date.split(' ');

  if (size === 'thumb') {
    return (
      <span aria-hidden className="block w-[68px] shrink-0 -rotate-3 drop-shadow-[0_4px_10px_rgba(20,20,20,0.10)] transition-transform group-hover:-rotate-1">
        <span className="receipt-edge flex flex-col gap-1 bg-white px-2 pb-4 pt-2.5">
          <span className="mx-auto h-1 w-9 rounded bg-ink/70" />
          <span className="mx-auto h-0.5 w-7 rounded bg-line-control" />
          <span className="mt-1 h-0.5 w-full rounded bg-line-control" />
          <span className="h-0.5 w-4/5 rounded bg-line-control" />
          <span className="mt-1 flex justify-between"><span className="h-1 w-5 rounded bg-ink/60" /><span className="h-1 w-4 rounded bg-ink/60" /></span>
        </span>
      </span>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[280px] px-3 py-3">
      {/* Scan frame corners */}
      <span aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${reading ? 'opacity-100' : 'opacity-0'}`}>
        <span className="absolute left-0 top-0 size-5 rounded-tl-[8px] border-l-2 border-t-2 border-ai-icon" />
        <span className="absolute right-0 top-0 size-5 rounded-tr-[8px] border-r-2 border-t-2 border-ai-icon" />
        <span className="absolute bottom-0 left-0 size-5 rounded-bl-[8px] border-b-2 border-l-2 border-ai-icon" />
        <span className="absolute bottom-0 right-0 size-5 rounded-br-[8px] border-b-2 border-r-2 border-ai-icon" />
      </span>
      <div className="relative drop-shadow-[0_6px_14px_rgba(20,20,20,0.07)]">
        <div className="receipt-edge flex flex-col gap-2.5 bg-white px-5 pb-9 pt-6 font-mono text-[12px] leading-relaxed text-ink-2">
          <div className="flex flex-col items-center text-center">
            <span className="text-[13px] font-bold text-ink"><Found on={found} delay={0}>{r.shop}</Found></span>
            <span className="text-[11px] text-secondary">{r.address}</span>
          </div>
          <div className="border-t border-dashed border-line-control" />
          <div className="flex justify-between text-[11px]"><Found on={found} delay={120}>{date}</Found><span className="text-secondary">{time}</span></div>
          <div className="flex justify-between gap-2"><Found on={found} delay={240}>{r.item}</Found><span>{money(r.amount)}</span></div>
          <div className="border-t border-dashed border-line-control" />
          <div className="flex justify-between font-bold text-ink"><span>TOTAL</span><Found on={found} delay={360}>{money(r.amount)}</Found></div>
          <span className="text-[11px] text-secondary">Paid by card ****4417</span>
          <span className="pt-1 text-center text-[11px] tracking-[0.2em] text-secondary-2">THANK YOU</span>
        </div>
        {reading && (
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="scan-once absolute inset-x-0 h-0.5 bg-ai-icon shadow-[0_0_14px_3px_rgba(91,69,214,0.45)]" />
          </span>
        )}
      </div>
    </div>
  );
}
