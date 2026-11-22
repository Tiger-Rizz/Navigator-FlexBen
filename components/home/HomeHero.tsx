import { getPersona } from '@/lib/data';
import { ActionPrompt } from './ActionPrompt';

export function HomeHero() {
  const persona = getPersona('priya');
  return (
    <section aria-labelledby="hello" className="flex flex-col items-center gap-4 bg-brand-tint px-4 pb-10 pt-11 text-center min-[900px]:px-12">
      <div className="flex flex-col items-center gap-1">
        <p className="text-[15px] text-ink-2">Hi {persona.firstName},</p>
        <h1 id="hello" className="text-2xl">Ready to explore your benefits?</h1>
      </div>
      <ActionPrompt />
    </section>
  );
}
