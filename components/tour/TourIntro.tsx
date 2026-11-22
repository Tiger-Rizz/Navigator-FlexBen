'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type { TourIntroContent } from './tours';

/** Step 0 of a tour: the scenario in two lines, who's who and the assumptions, before the journey starts. */
export function TourIntro({ intro, total, onStart, onExit }: { intro: TourIntroContent; total: number; onStart: () => void; onExit: () => void }) {
  const startRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
    const panel = panelRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onExit(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); onStart(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>('a[href], button')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart, onExit]);

  return (
    <div className="fixed inset-0 z-[80] flex overflow-y-auto px-4 py-6">
      <div aria-hidden className="fade-in fixed inset-0 bg-ink/30 backdrop-blur-[3px]" />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-intro-title"
        data-testid="tour-intro"
        className="rise relative m-auto flex w-full max-w-[600px] flex-col gap-5 rounded-[20px] border border-line bg-white px-6 py-6 shadow-[var(--shadow-float)] sm:px-8 sm:py-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-ai-text">Guided tour · Before you start</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-secondary">
            <CalendarDays aria-hidden size={13} />{intro.date}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h2 id="tour-intro-title" className="text-[22px]">{intro.title}</h2>
          <p className="text-[15px] leading-relaxed text-ink-2">{intro.scenario}</p>
        </div>

        {intro.people.length > 0 && (
          <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
            {intro.people.map((p) => (
              <li key={p.name} className="flex items-center gap-3 rounded-[12px] border border-line px-3.5 py-3">
                <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${p.muted ? 'border border-dashed border-line-control text-secondary' : 'bg-avatar text-avatar-text'}`}>{p.initials}</span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-xs text-secondary">{p.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {intro.assumptions.length > 0 && (
          <div className="flex flex-col gap-2 rounded-[14px] bg-[#F7F8F6] px-4 py-3.5">
            <h3 className="text-sm font-semibold">My assumptions</h3>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {intro.assumptions.map((a) => (
                <li key={a} className="flex gap-2 text-[13px] leading-relaxed text-ink-2">
                  <span aria-hidden className="shrink-0 text-[#767676]">•</span><span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button ref={startRef} type="button" onClick={onStart} data-testid="tour-intro-start" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-sm font-medium text-white cursor-pointer hover:bg-black">
            Start the journey<ArrowRight aria-hidden size={16} />
          </button>
          <Link href={intro.notesHref} onClick={onExit} className="inline-flex min-h-11 items-center text-sm underline underline-offset-2">Read my full notes</Link>
          <button type="button" onClick={onExit} className="ml-auto min-h-11 px-2 text-sm text-secondary underline-offset-2 hover:underline cursor-pointer">Exit tour</button>
        </div>
        <span className="-mt-2 text-[11px] text-secondary-2">{total} short steps · use → to move, Esc to exit</span>
      </section>
    </div>
  );
}
