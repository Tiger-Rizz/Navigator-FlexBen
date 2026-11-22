'use client';

import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Segmented } from '@/components/ui/Segmented';
import { scheme, type Selection } from '@/lib/data';
import { changedLevers, LEVER_LABEL, LEVERS, optionFor, type Lever } from '@/lib/plan';
import { baseline, usePlan } from '@/lib/store';

/** The four options Meridian has agreed with AXA, always in view, each with a hint that follows the choice. */
export function FineTune() {
  const { selection, setLever } = usePlan();
  const changed = changedLevers(baseline, selection);
  return (
    <section aria-labelledby="fine-tune" data-tour="fine-tune" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 id="fine-tune" className="text-lg">Fine-tune your cover</h2>
          {changed.length > 0 && <Badge tone="ai">Changed</Badge>}
        </div>
        <p className="text-[13px] text-secondary">Optional. These are the options Meridian has agreed with AXA, and every change updates your real monthly cost.</p>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
        {LEVERS.map((lever) => (
          <LeverGroup key={lever} lever={lever} selection={selection} changed={changed.includes(lever)} onChange={(v) => setLever(lever, v as never)} />
        ))}
      </div>
    </section>
  );
}

function LeverGroup({ lever, selection, changed, onChange }: { lever: Lever; selection: Selection; changed: boolean; onChange: (v: Selection[Lever]) => void }) {
  const opts = (scheme.options[lever] as { value: Selection[Lever]; label: string }[]).map((o) => ({ value: o.value, label: o.label }));
  return (
    <div className="flex flex-col gap-2">
      <Segmented label={LEVER_LABEL[lever]} options={opts} value={selection[lever]} onChange={onChange} />
      <p className={`flex items-start gap-1.5 text-[13px] ${changed ? 'text-ai-text' : 'text-secondary'}`} aria-live="polite">
        <Sparkles aria-hidden size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
        {optionFor(lever, selection[lever]).hint}
      </p>
    </div>
  );
}
