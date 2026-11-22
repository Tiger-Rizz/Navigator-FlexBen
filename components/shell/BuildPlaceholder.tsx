import type { ReactNode } from 'react';

/** Temporary content for main-flow screens that later build steps fill in. */
export function BuildPlaceholder({ step, children }: { step: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-line-control px-6 py-[22px] text-secondary">
      <p className="text-xs font-medium text-muted">Placeholder · built in step {step}</p>
      {children}
    </div>
  );
}
