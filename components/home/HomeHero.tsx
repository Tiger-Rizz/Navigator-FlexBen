'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { sendMessage } from '@/lib/ai/client';
import { usePersona } from '@/lib/store';

const PROMPTS = [
  'Should I add my partner to my health cover?',
  'What would a knee operation cost me?',
  'What’s changed in my health cover this year?',
  'What if we have a baby next year?',
];

export function HomeHero() {
  const router = useRouter();
  const persona = usePersona();
  const [text, setText] = useState('');
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PROMPTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section aria-labelledby="hello" className="flex flex-col items-center gap-[18px] bg-brand-tint px-4 pb-11 pt-12 min-[900px]:px-12">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[15px] text-ink-2">Hi {persona.firstName},</p>
        <h1 id="hello" className="text-2xl">Ready to explore your benefits?</h1>
      </div>
      <form
        className="flex w-full max-w-[620px] items-center gap-2.5 rounded-full border border-[#DDE8E4] bg-white py-1.5 pl-[18px] pr-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) void sendMessage(text);
          router.push('/benefits/pmi/chat');
        }}
      >
        <Sparkles aria-hidden size={17} strokeWidth={1.8} className="shrink-0 text-ai-icon" />
        <label className="flex-1">
          <span className="sr-only">Ask about your benefits</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={PROMPTS[i]} className="min-h-11 w-full bg-transparent text-[15px] outline-none" />
        </label>
        <button type="submit" aria-label="Ask" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white cursor-pointer">
          <ArrowRight aria-hidden size={16} />
        </button>
      </form>
    </section>
  );
}
