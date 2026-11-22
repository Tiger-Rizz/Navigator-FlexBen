'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { usePlan, usePersona, baseline } from '@/lib/store';
import { usePlanPricing } from '@/lib/hooks/usePlanPricing';
import { perMonth } from '@/lib/engine/format';
import { whoLabel } from '@/lib/plan';

const card =
  'flex min-h-11 flex-col gap-1 rounded-[12px] border px-3.5 py-3.5 text-left no-underline cursor-pointer transition-colors';

export function KeptBanner() {
  const { status, undo } = usePlan();
  if (status !== 'kept') return null;
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-[12px] border border-success-border bg-success-banner px-4 py-3 text-success">
      <Check aria-hidden size={18} />
      <p className="flex-1">
        <strong className="font-semibold">Your cover stays as it is from 1 April.</strong> Saved to My choices. You can still change it until 31 March.
      </p>
      <button type="button" onClick={undo} className="min-h-11 px-2 text-sm font-medium text-success underline underline-offset-2 cursor-pointer">
        Undo
      </button>
    </div>
  );
}

export function QuickChoices({ onAddFamily }: { onAddFamily: () => void }) {
  const { status, keepCurrent } = usePlan();
  const persona = usePersona();
  const now = usePlanPricing(baseline);
  const kept = status === 'kept';
  return (
    <div data-tour="quick-choices" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        type="button"
        aria-pressed={kept}
        onClick={keepCurrent}
        className={`${card} ${kept ? 'border-2 border-success bg-success-banner' : 'border-line-control bg-white hover:bg-surface-2'}`}
      >
        <span className="font-semibold">Keep my current cover</span>
        <span className="text-[13px] text-secondary">
          {perMonth(now.realMonthlyCost)}, {whoLabel(baseline, persona.peopleOnRecord) === 'Just you' ? 'just you' : whoLabel(baseline, persona.peopleOnRecord)}
        </span>
      </button>
      <button type="button" onClick={onAddFamily} className={`${card} border-line-control bg-white hover:bg-surface-2`}>
        <span className="font-semibold">Add family</span>
        <span className="text-[13px] text-secondary">Partner or children</span>
      </button>
      <Link href="/benefits/pmi/chat" className={`${card} border-ai-border bg-ai-soft hover:bg-ai-bg`}>
        <span className="font-semibold">Help me choose</span>
        <span className="text-[13px] text-ai-text">Talk through your options</span>
      </Link>
    </div>
  );
}
