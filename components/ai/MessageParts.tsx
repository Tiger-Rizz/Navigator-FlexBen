'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { usePersona, usePlan } from '@/lib/store';
import type { MessagePart } from '@/lib/ai/types';
import { BenefitLink } from './BenefitLink';
import { PrivacyNote } from './PrivacyNote';
import { ProposalCard } from './ProposalCard';
import { ScenarioCard } from './ScenarioCard';
import { SourceLine } from './SourceLine';

/** Renders one assistant message's parts. Chips call `onChip`. */
export function MessageParts({ parts, onChip }: { parts: MessagePart[]; onChip?: (text: string) => void }) {
  const persona = usePersona();
  const cover = usePlan((s) => s.cover);
  return (
    <div className="flex flex-col gap-2.5">
      {parts.map((p, i) => {
        switch (p.type) {
          case 'text':
            return <p key={i} className="whitespace-pre-line leading-relaxed">{p.text}</p>;
          case 'proposal':
            return <ProposalCard key={i} proposal={p.proposal} />;
          case 'scenario':
            return <ScenarioCard key={i} card={p.card} />;
          case 'links':
            return (
              <div key={i} className="flex flex-wrap gap-x-4">
                {p.items.map((name) => <BenefitLink key={name} name={name} />)}
              </div>
            );
          case 'privacy':
            return <PrivacyNote key={i} />;
          case 'sources':
            return <SourceLine key={i}>Sources: {p.items.join(', ')}</SourceLine>;
          case 'actions':
            return (
              <div key={i} className="flex flex-wrap gap-2.5">
                {p.items.map((a, ai) =>
                  a.href ? (
                    <Link key={a.label} href={a.href} className={buttonClass(ai === 0 ? 'primary' : 'secondary')}>{a.label}</Link>
                  ) : (
                    <button key={a.label} type="button" className={buttonClass('primary')} onClick={() => persona.peopleOnRecord[0] && cover(persona.peopleOnRecord[0].id)}>
                      {a.label}
                    </button>
                  ),
                )}
              </div>
            );
          case 'chips':
            return (
              <div key={i} className="flex flex-wrap gap-2">
                {p.items.map((c) => (
                  <button key={c} type="button" onClick={() => onChip?.(c)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-ai-border bg-white px-3.5 text-[13px] font-medium text-ai-text cursor-pointer hover:bg-ai-bg">
                    <Sparkles aria-hidden size={13} strokeWidth={1.8} />{c}
                  </button>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}

export function TypingDots() {
  return (
    <span role="status" aria-label="Thinking" className="inline-flex gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-pulse rounded-full bg-ai-icon" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  );
}
