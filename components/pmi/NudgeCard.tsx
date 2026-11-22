'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/Button';
import { usePlan, usePersona } from '@/lib/store';
import { firstName } from '@/lib/plan';
import { relationshipLabel } from '@/lib/engine/rules';

/** Spots a gap between people on record and the cover they have. Never infers life events. */
export function NudgeCard() {
  const persona = usePersona();
  const { selection, status, cover } = usePlan();
  const gap = persona.peopleOnRecord.find((p) => !selection.dependants.includes(p.id));
  if (!gap || status === 'kept' || status === 'confirmed') return null;
  const name = firstName(gap);
  return (
    <section aria-label="Suggestion" data-tour="nudge" className="flex flex-wrap items-center gap-4 rounded-[16px] border border-ai-border bg-ai-soft px-6 py-[18px]">
      <Sparkles aria-hidden size={18} strokeWidth={1.8} className="shrink-0 text-ai-icon" />
      <div className="flex min-w-[260px] flex-1 flex-col gap-1">
        <p className="text-[15px] leading-relaxed">
          {name} is listed as your {relationshipLabel(gap.relationship)} but <strong>isn’t on your health cover</strong>. Enrolment is the main time in the year to add family, and it closes on 31 March.
        </p>
        <span className="text-xs text-secondary-2">{name} is listed as a dependant in your HR record</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={() => cover(gap.id)}>Add {name}</Button>
        <Link href="/benefits/pmi/chat" className={buttonClass('secondary')}>Talk it through</Link>
      </div>
    </section>
  );
}
