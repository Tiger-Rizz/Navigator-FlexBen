'use client';

import { useId } from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { scheme, type Selection } from '@/lib/data';
import { monthlyDifference } from '@/lib/engine/pricing';
import { formatMonthly } from '@/lib/engine/format';
import { changedLevers, LEVER_LABEL, LEVERS, optionFor, type Lever } from '@/lib/plan';
import { baseline, usePeople, usePersona, usePlan } from '@/lib/store';
import { FeatureList } from './FeatureGrid';

/**
 * Fine-tune and its consequences in one place: options on the left, each priced against the current
 * choice; what you get on the right, compared with today's cover.
 */
export function FineTune() {
  const { selection, setLever } = usePlan();
  const changed = changedLevers(baseline, selection);
  return (
    <section aria-labelledby="fine-tune" data-tour="fine-tune" className="flex flex-col gap-7 rounded-[16px] border border-line bg-white px-6 py-7 sm:px-7">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 id="fine-tune" className="scroll-mt-10 text-lg">Fine-tune your cover</h2>
          {changed.length > 0 && <Badge tone="ai">Changed</Badge>}
        </div>
        <p className="text-[13px] text-secondary">Optional. Each option shows what it does to your monthly cost and your cover.</p>
      </div>
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          {LEVERS.map((lever) => (
            <LeverGroup key={lever} lever={lever} selection={selection} changed={changed.includes(lever)} onChange={(v) => setLever(lever, v as never)} />
          ))}
        </div>
        <div className="border-t border-divider pt-8 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
          <FeatureList />
        </div>
      </div>
    </section>
  );
}

function LeverGroup({ lever, selection, changed, onChange }: { lever: Lever; selection: Selection; changed: boolean; onChange: (v: Selection[Lever]) => void }) {
  const id = useId();
  const persona = usePersona();
  const people = usePeople();
  const opts = scheme.options[lever] as { value: Selection[Lever]; label: string }[];
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span id={id} className="text-[13px] font-medium">{LEVER_LABEL[lever]}</span>
        {baseline[lever] !== selection[lever] && <span className="text-xs text-secondary">Today: {optionFor(lever, baseline[lever]).label}</span>}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {opts.map((o) => {
          const on = o.value === selection[lever];
          const diff = on ? 0 : monthlyDifference(selection, { ...selection, [lever]: o.value }, people, persona.taxRate);
          const delta = on ? 'Selected' : Math.abs(diff) < 0.005 ? 'Same cost' : `${diff > 0 ? '+' : ''}${formatMonthly(diff)}`;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`flex min-h-12 flex-col items-start gap-0.5 rounded-[10px] border px-3.5 py-2 text-left cursor-pointer ${on ? 'border-ink bg-ink text-white' : 'border-line-control bg-white hover:bg-surface-2'}`}
            >
              <span className="text-sm font-medium">{o.label}</span>
              <span className={`text-[11px] ${on ? 'text-white/75' : diff < -0.005 ? 'text-success' : 'text-secondary'}`}>
                {delta}{!on && Math.abs(diff) >= 0.005 && <span className="sr-only"> a month</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className={`flex items-start gap-1.5 text-[13px] leading-relaxed ${changed ? 'text-ai-text' : 'text-secondary'}`} aria-live="polite">
        <Sparkles aria-hidden size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
        {optionFor(lever, selection[lever]).hint}
      </p>
    </div>
  );
}
