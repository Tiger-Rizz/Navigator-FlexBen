'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usePlan } from '@/lib/store';
import type { TourHelpers } from './steps';
import { TOURS, tourForPath, type TourId } from './tours';
import { TourIntro } from './TourIntro';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitFor: TourHelpers['waitFor'] = async (fn, timeoutMs = 6000) => {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(50);
  }
  return true;
};

type Rect = { top: number; left: number; width: number; height: number };

const SIDEBAR = 248;
const rightBox = (c: { w: number; h: number }): Rect => ({ left: window.innerWidth - 16 - c.w, top: window.innerHeight - 16 - c.h, width: c.w, height: c.h });
const leftBox = (c: { w: number; h: number }): Rect => ({ left: SIDEBAR, top: window.innerHeight - 16 - c.h, width: c.w, height: c.h });
function overlap(a: Rect, b: Rect) {
  const x = Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
  return x * y;
}

/** Starts the right tour from ?tour=1 (tour A on Navigator pages, P on /pay, C on /claims), then strips the parameter. */
function TourQueryStarter({ start }: { start: (id: TourId) => void }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    const key = `${pathname}?${params.toString()}`;
    if (params.get('tour') !== '1' || handled.current === key) return;
    handled.current = key;
    router.replace(pathname);
    start(tourForPath(pathname));
  }, [params, pathname, router, start]);
  return null;
}

export function TourProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const step = usePlan((s) => s.tourStep);
  const [intro, setIntro] = useState<TourId | null>(null);
  const tourId = usePlan((s) => s.tourId);
  const steps = TOURS[tourId].steps;
  const [running, setRunning] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [wide, setWide] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const captionRef = useRef<HTMLElement>(null);
  const [captionSize, setCaptionSize] = useState({ w: 400, h: 260 });
  const runId = useRef(0);

  const go = useCallback(async (route: string) => {
    if (window.location.pathname !== route) {
      router.push(route);
      await waitFor(() => window.location.pathname === route, 8000);
    }
  }, [router]);

  const runStep = useCallback(async (i: number) => {
    const id = ++runId.current;
    const s = TOURS[usePlan.getState().tourId].steps[i];
    setRunning(true);
    setRect(null);
    usePlan.getState().setTourStep(i);
    try {
      await go(s.route);
      await s.enter?.({ go, waitFor });
      await go(s.route);
      await waitFor(() => !!document.querySelector(s.target), 8000);
      const el = document.querySelector(s.target);
      if (el) {
        // Bring the target near the top, leaving the bottom of the screen for the caption.
        const top = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: Math.max(0, top) });
        // Let entrance animations (slide-in sheet, fade-up cards) settle before measuring the spotlight.
        const anims = (document.getAnimations?.() ?? []).filter((a) => a.effect?.getTiming().iterations !== Infinity);
        await Promise.race([Promise.all(anims.map((a) => a.finished.catch(() => undefined))), sleep(800)]);
      }
      await sleep(80);
    } finally {
      if (id === runId.current) {
        setRunning(false);
        requestAnimationFrame(() => nextRef.current?.focus({ preventScroll: true }));
      }
    }
  }, [go]);

  const start = useCallback((id: TourId) => {
    const s = usePlan.getState();
    TOURS[id].reset();
    s.setTourId(id);
    s.setTourActive(true);
    s.setTourStep(null);
    if (TOURS[id].intro) {
      // Step 0: set the scene on the first page of the journey, then wait for "Start the journey".
      setIntro(id);
      void go(TOURS[id].steps[0].route);
    } else void runStep(0);
  }, [runStep, go]);

  const begin = useCallback(() => {
    setIntro(null);
    void runStep(0);
  }, [runStep]);

  const exit = useCallback(() => {
    runId.current++;
    const s = usePlan.getState();
    s.setTourStep(null);
    s.setTourActive(false);
    setIntro(null);
    setRunning(false);
    setRect(null);
  }, []);

  const next = useCallback(() => {
    if (step === null || running) return;
    if (step >= steps.length - 1) {
      const finish = TOURS[usePlan.getState().tourId].finish;
      exit();
      if (finish) router.push(finish);
      return;
    }
    void runStep(step + 1);
  }, [step, steps, running, runStep, exit, router]);

  const back = useCallback(() => {
    if (step === null || running) return;
    if (step === 0) {
      // Back from step 1 returns to the scenario.
      const id = usePlan.getState().tourId;
      if (!TOURS[id].intro) return;
      runId.current++;
      usePlan.getState().setTourStep(null);
      setRect(null);
      setIntro(id);
      return;
    }
    void runStep(step - 1);
  }, [step, running, runStep]);

  // Track the spotlight target (content streams in and pages scroll).
  useEffect(() => {
    setWide(window.innerWidth >= 1280);
    if (step === null || running) return;
    const target = steps[step]?.target;
    if (!target) return;
    const measure = () => {
      setWide(window.innerWidth >= 1280);
      const el = document.querySelector(target);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : { top: r.top, left: r.left, width: r.width, height: r.height }));
    };
    measure();
    const t = setInterval(measure, 200);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => { clearInterval(t); window.removeEventListener('scroll', measure, true); window.removeEventListener('resize', measure); };
  }, [step, steps, running, pathname]);

  // Keyboard: → next, ← back, Esc exit.
  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
      else if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, next, back, exit]);

  const query = <Suspense fallback={null}><TourQueryStarter start={start} /></Suspense>;

  if (intro) {
    const t = TOURS[intro];
    return (
      <>
        {query}
        <TourIntro intro={t.intro!} total={t.steps.length} onStart={begin} onExit={exit} />
      </>
    );
  }

  if (step === null) return query;

  const s = steps[step];
  if (!s) return query;
  const last = step === steps.length - 1;
  const pad = 8;
  // Caption bottom-right, unless the spotlight sits there (e.g. the Ask panel); then bottom-left.
  const captionOnLeft = wide && !!rect && overlap(rect, rightBox(captionSize)) > overlap(rect, leftBox(captionSize));

  return (
    <>
      {query}
      {wide && rect && !running && (
        <div
          aria-hidden
          data-testid="tour-spotlight"
          className="pointer-events-none fixed z-[60] rounded-[14px] ring-2 ring-ai-icon transition-all duration-200"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 9999px rgba(20,20,20,0.42)' }}
        />
      )}
      <section
        ref={captionRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-what"
        data-testid="tour-caption"
        className={`fixed bottom-4 z-[70] flex w-[calc(100%-2rem)] flex-col gap-3 rounded-[16px] border border-line bg-white p-5 shadow-[var(--shadow-float)] sm:w-[400px] ${captionOnLeft ? 'left-4 min-[900px]:left-[248px]' : 'right-4'}`}
      >
        <span data-testid="tour-label" className="text-xs font-medium text-ai-text" aria-live="polite">Guided tour · Step {step + 1} of {steps.length}</span>
        <p id="tour-what" className="font-semibold leading-snug">{running ? 'Loading this step…' : s.what()}</p>
        {!running && <p className="text-[13px] text-secondary"><span className="font-medium text-ink">Why it matters: </span>{s.why}</p>}
        {last && !running && (
          <div className="flex flex-wrap gap-x-4">
            {TOURS[tourId].end.map((l) => (
              <Link key={l.href} href={l.href} onClick={exit} className="inline-flex min-h-11 items-center text-sm font-medium text-ai-text underline underline-offset-2">{l.label}</Link>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={back} disabled={(step === 0 && !TOURS[tourId].intro) || running}>Back</Button>
          <Button ref={nextRef} onClick={next} disabled={running} data-testid="tour-next">{last ? 'Finish' : 'Next'}</Button>
          <button type="button" onClick={exit} className="ml-auto min-h-11 px-2 text-sm text-secondary underline-offset-2 hover:underline cursor-pointer">Exit tour</button>
        </div>
        <span className="text-[11px] text-secondary-2">Use → and ← to move, Esc to exit.</span>
      </section>
    </>
  );
}

