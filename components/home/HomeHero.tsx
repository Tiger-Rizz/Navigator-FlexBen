import { getPersona } from '@/lib/data';

export function HomeHero() {
  const persona = getPersona('priya');
  return (
    <section aria-labelledby="hello" className="flex flex-col items-center gap-1 bg-brand-tint px-4 pb-10 pt-11 text-center min-[900px]:px-12">
      <p className="text-[15px] text-ink-2">Hi {persona.firstName},</p>
      <h1 id="hello" className="text-2xl">Ready to explore your benefits?</h1>
    </section>
  );
}
