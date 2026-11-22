import { Bike, HeartPulse, PiggyBank, Smile } from 'lucide-react';
import { employer, getPersona } from '@/lib/data';
import { ActionPrompt } from './ActionPrompt';

export const todayLabel = new Date(`${employer.demoToday}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

const tile = 'absolute flex items-center justify-center rounded-[14px] border border-brand-tint-border';

/** A few benefit tiles scattered around the greeting on wide screens. Decoration only. */
function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      <span className={`${tile} left-[7%] top-12 size-14 -rotate-[8deg] border-0 bg-axa text-sm font-bold text-white`}>AXA</span>
      <span className={`${tile} bottom-24 left-[15%] size-12 rotate-[6deg] bg-white text-brand`}><HeartPulse size={22} strokeWidth={1.8} /></span>
      <span className={`${tile} bottom-[42%] left-[2.5%] size-10 rotate-[10deg] bg-[#F3E9D8] text-avatar-text`}><PiggyBank size={18} strokeWidth={1.8} /></span>
      <span className={`${tile} right-[8%] top-14 h-14 w-[72px] rotate-[7deg] bg-white text-lg font-semibold text-brand`}>£500</span>
      <span className={`${tile} bottom-24 right-[16%] size-12 -rotate-[6deg] bg-[#E3F1D9] text-[#3F7322]`}><Bike size={22} strokeWidth={1.8} /></span>
      <span className={`${tile} bottom-[44%] right-[2.5%] size-10 -rotate-[10deg] bg-white text-brand`}><Smile size={18} strokeWidth={1.8} /></span>
    </div>
  );
}

export function HomeHero() {
  const persona = getPersona('priya');
  return (
    <section aria-labelledby="hello" className="relative overflow-hidden bg-brand-tint px-4 pb-10 pt-11 text-center min-[900px]:px-12 lg:pb-24 lg:pt-14">
      <Decor />
      <div className="relative flex flex-col items-center gap-5">
        <span className="rounded-full border border-brand-tint-border bg-white/70 px-3 py-1 text-xs font-medium text-secondary">{todayLabel}</span>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-base text-ink-2">Hi {persona.firstName},</p>
          <h1 id="hello" className="text-[28px] leading-tight tracking-[-0.02em] sm:text-[34px]">Ready to explore your benefits?</h1>
        </div>
        <ActionPrompt />
      </div>
    </section>
  );
}
