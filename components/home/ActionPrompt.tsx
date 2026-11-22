'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { employer } from '@/lib/data';
import { daysLeft } from '@/lib/engine/rules';
import { firstName } from '@/lib/plan';
import { usePersona, usePlan } from '@/lib/store';

/** One outstanding action, as a small prompt under the greeting. It always leads to the PMI page. */
export function useOutstandingAction() {
  const persona = usePersona();
  const { selection, status } = usePlan();
  const partner = persona.peopleOnRecord.find((p) => p.relationship !== 'child');
  if (status !== 'editing' || !partner) return null;
  const name = firstName(partner);
  return selection.dependants.includes(partner.id)
    ? { text: `Finish adding ${name} to your health cover` }
    : { text: `${name} isn’t on your health cover` };
}

export function ActionPrompt() {
  const action = useOutstandingAction();
  const status = usePlan((s) => s.status);

  if (!action) {
    if (status === 'editing') return null;
    return (
      <Link href="/benefits/pmi" className="rise inline-flex min-h-11 items-center gap-2 rounded-full border border-success-border bg-white px-4 py-2 text-sm text-success no-underline hover:bg-success-banner">
        <Check aria-hidden size={15} />Your health cover is confirmed for 1 April
      </Link>
    );
  }
  return (
    <Link
      href="/benefits/pmi"
      data-tour="home-nudge"
      aria-label={`1 action to review: ${action.text}. Enrolment closes in ${daysLeft(employer.demoToday)} days.`}
      className="rise group inline-flex min-h-11 max-w-full items-center gap-3 rounded-full border border-ai-border bg-white py-1.5 pl-1.5 pr-4 text-left no-underline shadow-[0_2px_10px_rgba(75,54,196,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(75,54,196,0.14)]"
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ai-bg px-2.5 py-1 text-xs font-semibold text-ai-text">
        <span aria-hidden className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ai-icon opacity-50 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-ai-icon" />
        </span>
        1 action
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{action.text}</span>
      <span className="hidden shrink-0 text-xs text-warning sm:inline">Closes in {daysLeft(employer.demoToday)} days</span>
      <ArrowRight aria-hidden size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
