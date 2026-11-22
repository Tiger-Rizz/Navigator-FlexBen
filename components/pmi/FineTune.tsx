'use client';

import { useId, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Segmented } from '@/components/ui/Segmented';
import { scheme, type Selection } from '@/lib/data';
import { changedLevers, LEVER_LABEL, LEVERS, leverSummary, optionFor, type Lever } from '@/lib/plan';
import { baseline, usePlan } from '@/lib/store';

export function FineTune() {
  const { selection, setLever } = usePlan();
  const [open, setOpen] = useState(false);
  const id = useId();
  const changed = changedLevers(baseline, selection).length > 0;

  return (
    <div className="flex flex-col gap-3 border-t border-divider pt-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[15px]">Fine-tune your cover</h3>
        {changed && <Badge tone="ai">Changed</Badge>}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-line-control bg-white px-3.5 text-sm font-medium cursor-pointer hover:bg-surface-2"
        >
          {open ? 'Hide options' : 'Adjust'}
          <ChevronDown aria-hidden size={16} className={open ? 'rotate-180' : ''} />
        </button>
      </div>
      {!open && (
        <p className="text-[13px] text-secondary">
          {leverSummary(selection).replace(/^./, (c) => c.toUpperCase())}. Change your excess, outpatient allowance or how you choose a specialist.
        </p>
      )}
      <div id={id} hidden={!open} className="flex flex-col gap-5">
        <p className="text-[13px] text-secondary">These are the options Meridian has agreed with AXA. Every change updates your real monthly cost.</p>
        {LEVERS.map((lever) => (
          <LeverGroup key={lever} lever={lever} selection={selection} onChange={(v) => setLever(lever, v as never)} />
        ))}
      </div>
    </div>
  );
}

function LeverGroup({ lever, selection, onChange }: { lever: Lever; selection: Selection; onChange: (v: Selection[Lever]) => void }) {
  const opts = (scheme.options[lever] as { value: Selection[Lever]; label: string }[]).map((o) => ({ value: o.value, label: o.label }));
  return (
    <div className="flex flex-col gap-2">
      <Segmented label={LEVER_LABEL[lever]} options={opts} value={selection[lever]} onChange={onChange} />
      <p className="flex items-start gap-1.5 text-[13px] text-ai-text" aria-live="polite">
        <Sparkles aria-hidden size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
        {optionFor(lever, selection[lever]).hint}
      </p>
    </div>
  );
}
