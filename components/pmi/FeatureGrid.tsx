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

export function FeatureGrid() {
  const persona = usePersona();
  const selection = usePlan((s) => s.selection);
  const features = featureViews(selection, baseline, persona.focusAreas);
  return (
    <section id="features" aria-labelledby="features-h" className="flex flex-col gap-4 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <div className="flex flex-col gap-1">
        <h2 id="features-h" className="text-lg">What your choices include</h2>
        <p className="text-[13px] text-secondary">Sorted by what you told us matters: {persona.focusAreas.join(', and ')}</p>
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = FEATURE_ICON[f.id] ?? HeartPulse;
          const off = f.status === 'Not on your plan';
          return (
            <li key={f.id} className={`flex gap-3 rounded-[12px] border p-3.5 ${f.changed ? 'border-ai-highlight bg-ai-soft' : 'border-line bg-white'}`}>
              <span aria-hidden className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] ${f.changed ? 'bg-ai-bg text-ai-icon' : off ? 'bg-surface-2 text-secondary-2' : 'bg-brand-tint text-brand'}`}>
                <Icon size={19} strokeWidth={1.8} />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className={`font-medium leading-snug ${off ? 'text-secondary' : ''}`}>{f.name}</span>
                <span className="text-[13px] text-secondary">{f.detail}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-secondary"><span aria-hidden className={`size-1.5 rounded-full ${DOT[f.status]}`} />{f.status}</span>
                  {f.relevant && <span className="font-medium text-ai-text">Relevant to you</span>}
                  {f.changed && <span className="font-medium text-ai-text">Changed</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
