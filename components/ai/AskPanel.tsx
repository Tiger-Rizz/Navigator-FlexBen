'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import { sendMessage } from '@/lib/ai/client';
import { COMMON_QUESTIONS } from '@/lib/ai/questions';
import { usePlan } from '@/lib/store';
import { MessageParts, TypingDots } from './MessageParts';

/** Floating "Ask AI about this benefit" pill (PMI pages) and the Navigator-style search pop-up. */
export function AskPanel() {
  const pathname = usePathname();
  const { askOpen, setAskOpen, messages, busy, takeAskQuery, askQuery } = usePlan();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const onChat = pathname.startsWith('/benefits/pmi/chat');
  const showPill = pathname.startsWith('/benefits/pmi') && !onChat && !pathname.startsWith('/benefits/pmi/review');

  // Ask a queued question (from Common questions or a tour step).
  useEffect(() => {
    if (!askOpen) return;
    const q = takeAskQuery();
    if (q) void sendMessage(q);
    else inputRef.current?.focus();
  }, [askOpen, askQuery, takeAskQuery]);

  useEffect(() => {
    if (!askOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setAskOpen(false); pillRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [askOpen, setAskOpen]);

  const lastUser = messages.map((m) => m.role).lastIndexOf('user');
  const question = lastUser >= 0 ? messages[lastUser] : null;
  const answer = lastUser >= 0 ? messages[lastUser + 1] : null;
  const questionText = question?.parts[0]?.type === 'text' ? question.parts[0].text : '';
  const chips = COMMON_QUESTIONS.filter((q) => q !== questionText).slice(0, 4);

  const ask = (q: string) => { setText(''); void sendMessage(q); };

  return (
    <>
      {showPill && !askOpen && (
        <button
          ref={pillRef}
          type="button"
          onClick={() => setAskOpen(true)}
          data-tour="ask-pill"
          className="fixed bottom-6 right-6 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-ai-border bg-white px-5 font-medium text-ai-text shadow-[var(--shadow-float)] cursor-pointer hover:bg-ai-soft"
        >
          <Sparkles aria-hidden size={17} strokeWidth={1.8} className="text-ai-icon" />
          Ask AI about this benefit
        </button>
      )}
      {askOpen && (
        <section
          role="dialog"
          aria-label="Ask AI"
          data-tour="ask-panel"
          className="fixed bottom-4 right-4 left-4 z-50 flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[16px] border border-line bg-white shadow-[var(--shadow-float)] sm:left-auto sm:w-[440px]"
        >
          <form
            className="flex items-center gap-2 border-b border-line px-4 py-2"
            onSubmit={(e) => { e.preventDefault(); ask(text); }}
          >
            <Search aria-hidden size={17} className="shrink-0 text-secondary-2" />
            <label className="flex-1">
              <span className="sr-only">Search or ask a question</span>
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask about Private Medical Insurance…"
                className="min-h-11 w-full bg-transparent outline-none"
              />
            </label>
            <button type="submit" aria-label="Ask" disabled={busy} className="flex size-10 items-center justify-center rounded-full bg-ink text-white cursor-pointer disabled:opacity-50">
              <ArrowRight aria-hidden size={16} />
            </button>
            <button type="button" aria-label="Close" onClick={() => setAskOpen(false)} className="flex size-11 items-center justify-center rounded-[10px] cursor-pointer hover:bg-surface-2">
              <X aria-hidden size={18} />
            </button>
          </form>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {question && (
              <div className="flex flex-col gap-3">
                <span className="self-start rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white">{questionText}</span>
                {answer && answer.parts.length > 0 ? <MessageParts parts={answer.parts} onChip={ask} /> : busy && <TypingDots />}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-secondary-2">Suggested questions</span>
              <ul className="m-0 flex list-none flex-col p-0">
                {chips.map((c) => (
                  <li key={c}>
                    <button type="button" onClick={() => ask(c)} disabled={busy} className="flex min-h-11 w-full items-center gap-2 rounded-[8px] px-1 text-left text-sm cursor-pointer hover:bg-ai-soft disabled:opacity-60">
                      <Sparkles aria-hidden size={14} strokeWidth={1.8} className="shrink-0 text-ai-icon" />
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2">
            <span className="text-xs text-secondary-2">Answers use your current choices</span>
            <Link href="/benefits/pmi/chat" onClick={() => setAskOpen(false)} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ai-text">
              Continue in Chat <ArrowRight aria-hidden size={14} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
