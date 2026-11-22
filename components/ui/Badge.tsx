import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'ai' | 'error';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-chip text-secondary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  ai: 'bg-ai-bg text-ai-text',
  error: 'bg-[#FDECEA] text-error',
};

/** Small status label (6px radius), e.g. "Enrolment closes in 9 days", "Included". */
export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-[3px] text-xs font-medium whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
