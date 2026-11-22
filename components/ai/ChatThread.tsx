'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { sendMessage } from '@/lib/ai/client';
import { BUILDER_CHIPS, CANONICAL_OPENING } from '@/lib/ai/questions';
import { firstName } from '@/lib/plan';
import { usePersona, usePlan } from '@/lib/store';
import { MemberContextCard } from './MemberContextCard';
import { MessageParts, TypingDots } from './MessageParts';

export function ChatThread() {
  const persona = usePersona();
  const { messages, busy, selection, proposal } = usePlan();
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages]);

  const partner = persona.peopleOnRecord[0];
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => (m.parts[0]?.type === 'text' ? m.parts[0].text : '')));
  const partnerProposed = !!partner && !!proposal?.selection.dependants.includes(partner.id);
  // The opening chip sends the full canonical message (CLAUDE.md §11); other chips send their label.
  const chips = [
    ...(partner && !selection.dependants.includes(partner.id) && !partnerProposed ? [{ label: `Add ${firstName(partner)} without it costing a fortune`, text: CANONICAL_OPENING }] : []),
    ...BUILDER_CHIPS.map((c) => ({ label: c, text: c })),
  ].filter((c) => !asked.has(c.text));
  const send = (t: string) => { setText(''); void sendMessage(t); };

  return (
    <section aria-label="Conversation" className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-5" aria-live="polite">
        <MemberContextCard />
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={m.id} className="self-end max-w-[85%] rounded-[16px] rounded-br-[4px] bg-ink px-4 py-2.5 text-white">
              {m.parts[0]?.type === 'text' ? m.parts[0].text : ''}
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2.5">
              <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ai-bg">
                <Sparkles size={14} strokeWidth={1.8} className="text-ai-icon" />
              </span>
              <div className="min-w-0 flex-1">
                {m.parts.length ? <MessageParts parts={m.parts} onChip={send} /> : busy && i === messages.length - 1 && <TypingDots />}
              </div>
            </div>
          ),
        )}
        <div ref={endRef} style={{ scrollMarginBottom: 220 }} />
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2.5 bg-white pb-4 pt-2">
        {chips.length > 0 && <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => (
            <button key={c.label} type="button" disabled={busy} onClick={() => send(c.text)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line-control bg-white px-3.5 text-[13px] text-ink cursor-pointer hover:bg-surface-2 disabled:opacity-60">
              <Sparkles aria-hidden size={13} strokeWidth={1.8} />{c.label}
            </button>
          ))}
        </div>}
        <form data-tour="chat-input" className="flex items-center gap-2 rounded-full border border-line-control bg-white py-1 pl-4 pr-1" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <label className="flex-1">
            <span className="sr-only">Message</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tell me what you want to change, or ask anything" className="min-h-11 w-full bg-transparent outline-none" />
          </label>
          <button type="submit" aria-label="Send" disabled={busy || !text.trim()} className="flex size-10 items-center justify-center rounded-full bg-ink text-white cursor-pointer disabled:opacity-40">
            <ArrowRight aria-hidden size={16} />
          </button>
        </form>
        <p className="text-xs text-secondary-2">Guidance, not financial advice. Prices and tax are calculated by Navigator, not by the AI.</p>
      </div>
    </section>
  );
}
