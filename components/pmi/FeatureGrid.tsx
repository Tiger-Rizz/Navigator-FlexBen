'use client';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { featureViews } from '@/lib/plan';
import { baseline, usePersona, usePlan } from '@/lib/store';
import type { FeatureStatus } from '@/lib/data';

const TONE: Record<FeatureStatus, BadgeTone> = { Included: 'success', Limited: 'warning', 'Not on your plan': 'neutral' };

export function FeatureGrid() {
  const persona = usePersona();
  const selection = usePlan((s) => s.selection);
  const features = featureViews(selection, baseline, persona.focusAreas);
  return (
    <section id="features" aria-labelledby="features-h" className="flex flex-col gap-4 rounded-[16px] border border-line px-6 py-[22px]">
      <div className="flex flex-col gap-1">
        <h2 id="features-h" className="text-lg">What your choices include</h2>
        <p className="text-[13px] text-secondary">
          Sorted by what you told us matters: {persona.focusAreas.join(', and ')}
        </p>
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
        {features.map((f) => (
          <li
            key={f.id}
            className={`flex flex-col gap-1.5 rounded-[12px] border p-3.5 ${f.changed ? 'border-ai-highlight bg-ai-soft' : 'border-line bg-white'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">{f.name}</span>
              <Badge tone={TONE[f.status]}>{f.status}</Badge>
            </div>
            <span className="text-[13px] text-secondary">{f.detail}</span>
            <div className="flex flex-wrap gap-1.5">
              {f.relevant && <span className="text-xs font-medium text-ai-text">Relevant to you</span>}
              {f.changed && <span className="sr-only">Changed from your current plan</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
