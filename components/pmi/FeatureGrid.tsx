'use client';

import { Bone, Brain, Glasses, HandHeart, HeartPulse, Ribbon, ScanLine, Stethoscope, type LucideIcon } from 'lucide-react';
import { featureViews } from '@/lib/plan';
import { baseline, usePersona, usePlan } from '@/lib/store';
import type { FeatureStatus } from '@/lib/data';

export const FEATURE_ICON: Record<string, LucideIcon> = {
  'mental-health': Brain, physio: Bone, 'virtual-gp': Stethoscope, cancer: Ribbon,
  outpatient: HeartPulse, scans: ScanLine, therapies: HandHeart, 'dental-optical': Glasses,
};
const DOT: Record<FeatureStatus, string> = { Included: 'bg-[#1D8A4F]', Limited: 'bg-[#B5651D]', 'Not on your plan': 'bg-[#B4B4B4]' };

/**
 * What the current choices include, in a fixed order so nothing jumps around.
 * Anything that differs from today's cover is highlighted, with today's value underneath.
 */
export function FeatureList() {
  const persona = usePersona();
  const selection = usePlan((s) => s.selection);
  const features = featureViews(selection, baseline, persona.focusAreas);
  const changed = features.filter((f) => f.changed);

  return (
    <div id="features" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold">What you get</h3>
        <p role="status" className={`text-[13px] ${changed.length ? 'font-medium text-ai-text' : 'text-secondary'}`}>
          {changed.length
            ? `${changed.length} ${changed.length === 1 ? 'thing differs' : 'things differ'} from your cover today, highlighted below.`
            : 'The same as your cover today. Change an option to see what moves.'}
        </p>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {features.map((f) => {
          const Icon = FEATURE_ICON[f.id] ?? HeartPulse;
          const off = f.status === 'Not on your plan';
          return (
            <li key={f.id} className={`flex gap-3 border-t border-divider px-2 py-2.5 first:border-t-0 ${f.changed ? 'rounded-[10px] border-t-transparent bg-ai-bg' : ''}`}>
              <span aria-hidden className={`flex size-8 shrink-0 items-center justify-center rounded-[8px] ${f.changed ? 'bg-white text-ai-icon' : off ? 'bg-surface-2 text-secondary-2' : 'bg-brand-tint text-brand'}`}>
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={`text-sm font-medium leading-snug ${off ? 'text-secondary' : ''}`}>{f.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-secondary"><span aria-hidden className={`size-1.5 rounded-full ${DOT[f.status]}`} />{f.status}</span>
                </div>
                <span className={`text-[13px] ${f.changed ? 'font-medium text-ai-text' : 'text-secondary'}`}>{f.detail}</span>
                {f.changed && <span className="text-xs text-secondary">Today: {f.wasDetail}</span>}
                {f.relevant && !f.changed && <span className="text-xs font-medium text-ai-text">Relevant to you</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
