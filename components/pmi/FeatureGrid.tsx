'use client';

import { Bone, Brain, Check, Glasses, HandHeart, HeartPulse, Ribbon, ScanLine, Sparkles, Stethoscope, type LucideIcon } from 'lucide-react';
import { featureViews } from '@/lib/plan';
import { baseline, usePersona, usePlan } from '@/lib/store';

export const FEATURE_ICON: Record<string, LucideIcon> = {
  'mental-health': Brain, physio: Bone, 'virtual-gp': Stethoscope, cancer: Ribbon,
  outpatient: HeartPulse, scans: ScanLine, therapies: HandHeart, 'dental-optical': Glasses,
};

/**
 * What the current choices include, in a fixed order so nothing jumps around.
 * The icon carries the status: green with a tick when included, grey when not, purple when it differs from today.
 */
export function FeatureList() {
  const persona = usePersona();
  const selection = usePlan((s) => s.selection);
  const features = featureViews(selection, baseline, persona.focusAreas);
  const changed = features.filter((f) => f.changed).length;
  const included = features.filter((f) => f.status !== 'Not on your plan').length;

  return (
    <div id="features" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-[15px] font-semibold">What you get</h3>
          <span className="flex items-center gap-3 text-[11px] text-secondary">
            <span className="inline-flex items-center gap-1"><span aria-hidden className="flex size-3.5 items-center justify-center rounded-full bg-[#1D8A4F] text-white"><Check size={9} strokeWidth={3} /></span>Included</span>
            <span className="inline-flex items-center gap-1"><Sparkles aria-hidden size={12} strokeWidth={1.8} className="text-ai-icon" />Relevant to you</span>
          </span>
        </div>
        <p role="status" className={`text-[13px] ${changed ? 'font-medium text-ai-text' : 'text-secondary'}`}>
          {changed
            ? `${changed} ${changed === 1 ? 'change' : 'changes'} from your cover today, highlighted below.`
            : `${included} of ${features.length} included. Change an option to see what moves.`}
        </p>
      </div>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {features.map((f) => {
          const Icon = FEATURE_ICON[f.id] ?? HeartPulse;
          const off = f.status === 'Not on your plan';
          const limited = f.status === 'Limited';
          const tile = f.changed
            ? 'bg-white text-ai-icon ring-1 ring-ai-highlight'
            : off ? 'bg-surface-2 text-[#A8A8A8]' : 'bg-brand-tint text-brand';
          return (
            <li key={f.id} className={`flex items-center gap-3 rounded-[12px] px-2.5 py-2 transition-colors ${f.changed ? 'bg-ai-bg' : ''}`}>
              <span aria-hidden className={`relative flex size-9 shrink-0 items-center justify-center rounded-[10px] ${tile}`}>
                <Icon size={17} strokeWidth={1.8} />
                {!off && (
                  <span className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ring-2 ${f.changed ? 'ring-ai-bg' : 'ring-white'} ${limited ? 'bg-[#B5651D]' : 'bg-[#1D8A4F]'} text-white`}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className={`flex items-center gap-1.5 text-sm leading-snug ${off ? 'text-secondary-2' : 'font-semibold text-ink'}`}>
                  {f.name}
                  {f.relevant && <Sparkles size={12} strokeWidth={1.8} className="shrink-0 text-ai-icon" aria-label="Relevant to you" />}
                </span>
                <span className={`text-[13px] leading-snug ${f.changed ? 'font-medium text-ai-text' : off ? 'text-secondary-2' : 'text-secondary'}`}>
                  {f.detail}
                </span>
                {f.changed && <span className="text-xs text-secondary-2">Today: {f.wasDetail}</span>}
              </div>
              <span className="sr-only">{off ? 'Not on your plan' : limited ? 'Included, limited' : 'Included'}{f.changed ? ', changed from today' : ''}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
