'use client';

import { pay, signedMoney, waterfall } from '@/lib/part2';

type Col = { id: string; label: string; amount: number; from: number; to: number; kind: 'gain' | 'loss' | 'total' };

const FILL = { gain: 'bg-gain', loss: 'bg-loss', total: 'bg-ink' } as const;

/**
 * Where the take-home change comes from: each change moves the running total up or down,
 * ending at the net change. Every column is labelled, so colour never carries meaning alone.
 */
export function Waterfall({ openId, onPick }: { openId: string | null; onPick: (id: string) => void }) {
  const cols: Col[] = [
    ...waterfall().map((s) => ({ ...s, kind: (s.amount >= 0 ? 'gain' : 'loss') as Col['kind'] })),
    { id: 'total', label: 'Take\u2011home', amount: pay.takeHomeChange, from: 0, to: pay.takeHomeChange, kind: 'total' },
  ];
  const max = Math.max(...cols.map((c) => Math.max(c.from, c.to)));
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="relative h-[168px]">
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line" />
        <ol className="absolute inset-x-0 bottom-0 top-7 m-0 grid list-none grid-cols-5 p-0">
          {cols.map((c, i) => {
            const lo = Math.min(c.from, c.to);
            const hi = Math.max(c.from, c.to);
            const bar = (
              <>
                <span
                  aria-hidden
                  className={`absolute left-1/2 w-6 -translate-x-1/2 rounded-[4px] transition-opacity ${FILL[c.kind]}`}
                  style={{ bottom: pct(lo), height: `max(${pct(hi - lo)}, 4px)` }}
                />
                <span
                  aria-hidden
                  className={`absolute inset-x-0 text-center text-xs tabular-nums ${c.kind === 'total' ? 'font-semibold text-ink' : 'font-medium text-ink-2'}`}
                  style={{ bottom: `calc(${pct(hi)} + 6px)` }}
                >
                  {signedMoney(c.amount)}
                </span>
              </>
            );
            return (
              <li key={c.id} className="group relative">
                {c.kind !== 'total' && (
                  <span aria-hidden className={`absolute -top-7 bottom-0 left-1 right-1 rounded-[10px] transition-colors group-hover:bg-surface-2/70 ${openId === c.id ? 'bg-surface-2' : ''}`} />
                )}
                {i < cols.length - 1 && (
                  <span aria-hidden className="absolute h-px bg-line-control" style={{ bottom: pct(c.to), left: 'calc(50% + 12px)', width: 'calc(100% - 24px)' }} />
                )}
                {bar}
                {c.kind === 'total' ? (
                  <span className="sr-only">Change in take-home: {signedMoney(c.amount)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPick(c.id)}
                    aria-label={`${c.label}: ${signedMoney(c.amount)} take-home. Show the maths`}
                    aria-pressed={openId === c.id}
                    className="absolute -top-7 bottom-0 left-1 right-1 z-10 rounded-[10px] cursor-pointer"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <ol aria-hidden className="m-0 grid list-none grid-cols-5 p-0">
        {cols.map((c) => (
          <li key={c.id} className={`px-1 text-center text-xs leading-tight ${openId === c.id || c.kind === 'total' ? 'font-semibold text-ink' : 'text-secondary'}`}>{c.label}</li>
        ))}
      </ol>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-gain" />Adds to your take-home</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-loss" />Comes off it</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-[3px] bg-ink" />Change on March</span>
      </figcaption>
    </figure>
  );
}
