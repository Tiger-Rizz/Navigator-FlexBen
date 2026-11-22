'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import { shortAnswers } from '@/lib/ai/shortAnswers';
import { usePeople, usePersona, usePlan } from '@/lib/store';

export function CommonQuestions() {
  const persona = usePersona();
  const people = usePeople();
  const { selection, openAsk } = usePlan();
  const rows = shortAnswers(persona, selection, people);
  return (
    <section aria-labelledby="faq" className="flex flex-col gap-3 rounded-[16px] border border-line px-6 py-[22px]">
      <h2 id="faq" className="text-lg">Common questions</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {rows.map((r) => (
          <li key={r.q} className="border-t border-divider first:border-t-0">
            <button
              type="button"
              onClick={() => openAsk(r.q)}
              className="flex min-h-11 w-full items-center gap-3 py-3 text-left cursor-pointer hover:bg-surface-2"
            >
              <Sparkles aria-hidden size={15} strokeWidth={1.8} className="shrink-0 text-ai-icon" />
              <span className="flex flex-1 flex-col">
                <span className="font-medium">{r.q}</span>
                <span className="text-[13px] text-secondary">{r.short}</span>
              </span>
              <ChevronRight aria-hidden size={16} className="text-secondary-2" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
