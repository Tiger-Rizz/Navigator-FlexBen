'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessagesSquare, Sparkles, X } from 'lucide-react';
import { sendMessage } from '@/lib/ai/client';
import { COMMON_QUESTIONS } from '@/lib/ai/questions';
import { pay } from '@/lib/part2';
import { usePlan } from '@/lib/store';
import { MessageParts, TypingDots } from './MessageParts';

/** Floating "Ask more about this benefit" pill (PMI pages) and the Ask panel: answer above, composer below. */
export function AskPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { askOpen, setAskOpen, messages, busy, takeAskQuery, askQuery } = usePlan();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const onPay = pathname.startsWith('/pay');
  const onChat = pathname.startsWith('/benefits/pmi/chat');
  // The comparison has its own what-if box and a decision bar, so the pill steps aside there.
  const showPill = pathname.startsWith('/benefits/pmi') && !onChat && !pathname.startsWith('/benefits/pmi/review') && !pathname.startsWith('/benefits/pmi/scenarios');

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

  // Follow the answer while it streams, then return to the question so it reads from the top.
  useEffect(() => {
    const el = bodyRef.current;
    if (askOpen && el) el.scrollTo({ top: busy ? el.scrollHeight : 0 });
  }, [askOpen, messages, busy]);

  // The chat page has the full conversation, so the panel steps aside there.
  useEffect(() => {
    if (onChat && askOpen) setAskOpen(false);
  }, [onChat, askOpen, setAskOpen]);

  const lastUser = messages.map((m) => m.role).lastIndexOf('user');
  const question = lastUser >= 0 ? messages[lastUser] : null;
  const answer = lastUser >= 0 ? messages[lastUser + 1] : null;
  const questionText = question?.parts[0]?.type === 'text' ? question.parts[0].text : '';
  const pool: readonly string[] = onPay ? pay.questions.map((x) => x.q) : COMMON_QUESTIONS;
  const chips = pool.filter((q) => q !== questionText).slice(0, question ? 3 : 4);

  const ask = (q: string) => { if (!q.trim()) return; setText(''); void sendMessage(q); };
  const toChat = () => { setAskOpen(false); router.push('/benefits/pmi/chat'); };

  return (
    <>
      {showPill && !askOpen && (
        <button
          ref={pillRef}
          type="button"
          onClick={() => setAskOpen(true)}
          data-tour="ask-pill"
          className="fixed bottom-24 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-ai-border bg-white px-5 font-medium text-ai-text shadow-[var(--shadow-float)] cursor-pointer hover:bg-ai-soft lg:bottom-6 lg:right-6"
        >
          <Sparkles aria-hidden size={17} strokeWidth={1.8} className="text-ai-icon" />
          Ask more about this benefit
        </button>
      )}
      {askOpen && (
        <section
          role="dialog"
          aria-label={onPay ? 'Ask about your pay' : 'Ask about this benefit'}
          data-tour="ask-panel"
          className="rise fixed bottom-4 left-4 right-4 z-50 flex max-h-[min(640px,calc(100vh-2rem))] flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-[var(--shadow-float)] sm:left-auto sm:w-[440px]"
        >
          <header className="flex items-center gap-2 border-b border-line py-1.5 pl-4 pr-1.5">
            <Sparkles aria-hidden size={16} strokeWidth={1.8} className="text-ai-icon" />
            <span className="flex-1 text-sm font-semibold">{onPay ? 'Ask about your pay' : 'Ask about this benefit'}</span>
            {question && !onPay && (
              <button type="button" onClick={toChat} className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-medium text-ai-text cursor-pointer hover:bg-ai-soft">
                <MessagesSquare aria-hidden size={15} strokeWidth={1.8} />Continue in chat
              </button>
            )}
            <button type="button" aria-label="Close" onClick={() => setAskOpen(false)} className="flex size-11 items-center justify-center rounded-[10px] cursor-pointer hover:bg-surface-2">
              <X aria-hidden size={18} />
            </button>
          </header>

          <div ref={bodyRef} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {question ? (
              <div className="flex flex-col gap-3">
                <span className="max-w-[88%] self-end rounded-[16px] rounded-br-[4px] bg-ink px-3.5 py-2 text-[13px] font-medium text-white">{questionText}</span>
                {answer && answer.parts.length > 0 ? <MessageParts parts={answer.parts} onChip={ask} /> : busy && <TypingDots />}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-secondary">
                {onPay ? 'Ask about your payslip. Answers come from your March and April payslips.' : 'Ask anything about your health cover. Answers use your current choices, and every figure is calculated, not guessed.'}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-secondary-2">{question ? 'Ask next' : 'Suggested questions'}</span>
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

          <div className="flex flex-col gap-1.5 border-t border-line px-3 pb-2.5 pt-3">
            <form className="flex items-center gap-2 rounded-full border border-line-control bg-white py-1 pl-4 pr-1 focus-within:border-ai-highlight" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
              <label className="flex-1">
                <span className="sr-only">Ask a question</span>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={onPay ? 'Ask about your pay…' : 'Ask about Private Medical Insurance…'}
                  className="min-h-10 w-full bg-transparent text-sm outline-none"
                />
              </label>
              <button type="submit" aria-label="Ask" disabled={busy || !text.trim()} className="flex size-10 items-center justify-center rounded-full bg-ink text-white cursor-pointer disabled:opacity-40">
                <ArrowRight aria-hidden size={16} />
              </button>
            </form>
            <span className="px-2 text-[11px] text-secondary-2">Guidance, not financial advice.</span>
          </div>
        </section>
      )}
    </>
  );
}
