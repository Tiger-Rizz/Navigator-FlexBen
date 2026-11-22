'use client';

import Link from 'next/link';
import { ArrowRight, Check, Heart, Sparkles } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { relationshipLabel } from '@/lib/engine/rules';
import { countChanges, featureViews, firstName } from '@/lib/plan';
import { coveredHeadline } from '@/lib/reviewView';
import { baseline, usePeople, usePersona, usePlan } from '@/lib/store';
import { CoverPanel } from './CoverPanel';
import { FEATURE_ICON } from './FeatureGrid';
import { Faqs } from './Faqs';

/** Where Navigator shows "Plan information · Manage benefit", the flex prompt lives instead. */
function FlexPrompt() {
  const persona = usePersona();
  const people = usePeople();
  const { selection, confirmedSelection, status } = usePlan();
  const gap = persona.peopleOnRecord.find((p) => !selection.dependants.includes(p.id));
  const changes = countChanges(baseline, selection);
  const shell = 'flex flex-col gap-3 rounded-[16px] border bg-white px-5 py-5';

  if (status !== 'editing') {
    return (
      <section aria-labelledby="flex-prompt" className={`${shell} border-success-border`}>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success"><Check aria-hidden size={15} />Confirmed</span>
        <h2 id="flex-prompt" className="text-lg leading-snug">{coveredHeadline(confirmedSelection ?? selection, people)}</h2>
        <p className="text-[13px] text-secondary">Saved to My choices. You can still change it until 31 March.</p>
        <Link href="/my-choices" className={buttonClass('secondary', 'w-full')}>See my choices</Link>
      </section>
    );
  }
  if (gap) {
    const name = firstName(gap);
    return (
      <section aria-labelledby="flex-prompt" className={`${shell} border-ai-border`}>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ai-text"><Sparkles aria-hidden size={15} strokeWidth={1.8} />Flex benefit · you choose your cover</span>
        <h2 id="flex-prompt" className="text-lg leading-snug">{name} isn’t on your health cover</h2>
        <p className="text-sm leading-relaxed text-ink-2">
          {name} is listed as your {relationshipLabel(gap.relationship)} but isn’t covered. Enrolment is the main time in the year to add family or change your cover, and it closes on 31 March.
        </p>
        <span className="text-xs text-secondary-2">{name} is listed as a dependant in your HR record</span>
        <Link href="/benefits/pmi/cover" className={buttonClass('primary', 'w-full')}>Review my health cover<ArrowRight aria-hidden size={16} /></Link>
      </section>
    );
  }
  return (
    <section aria-labelledby="flex-prompt" className={`${shell} border-ai-border`}>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ai-text"><Sparkles aria-hidden size={15} strokeWidth={1.8} />Flex benefit · you choose your cover</span>
      <h2 id="flex-prompt" className="text-lg leading-snug">{changes ? `You have ${changes} ${changes === 1 ? 'change' : 'changes'} to confirm` : 'Your cover is open for changes'}</h2>
      <p className="text-sm leading-relaxed text-ink-2">
        {changes ? 'Nothing changes until you confirm. Enrolment closes on 31 March.' : 'You can change who’s covered and how until 31 March.'}
      </p>
      <Link href={changes ? '/benefits/pmi/review' : '/benefits/pmi/cover'} className={buttonClass('primary', 'w-full')}>
        {changes ? 'Review and confirm' : 'Review my health cover'}<ArrowRight aria-hidden size={16} />
      </Link>
    </section>
  );
}

export function PmiOverview() {
  const persona = usePersona();
  const selection = usePlan((s) => s.selection);
  const features = featureViews(selection, baseline, persona.focusAreas).filter((f) => f.status !== 'Not on your plan');

  return (
    <div className="rise relative px-4 pb-24 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <section aria-labelledby="overview" className="flex flex-col gap-5 rounded-[16px] border border-line bg-white px-6 py-6">
            <div className="flex flex-col gap-3">
              <h2 id="overview" className="text-xl">Overview</h2>
              <p className="text-[15px] leading-relaxed text-ink-2">
                Private Medical Insurance gets you seen quickly when you need a specialist, tests or treatment, without long waiting lists. It includes a virtual GP you can speak to by phone or video, day or night. Meridian pays for your own Core cover, and you choose the rest during enrolment each March: who’s covered, your excess and how you pick a specialist.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-t border-divider pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Included features</h3>
                <Link href="/benefits/pmi/cover#features" className="inline-flex min-h-11 items-center text-sm font-medium">See all</Link>
              </div>
              <ul tabIndex={0} aria-label="Included features, scroll sideways for more" className="m-0 -mx-1 flex list-none gap-3 overflow-x-auto p-1 pb-2">
                {features.map((f) => {
                  const Icon = FEATURE_ICON[f.id];
                  return (
                    <li key={f.id} className="flex w-[232px] shrink-0 flex-col gap-2 rounded-[12px] border border-line p-4">
                      <div className="flex items-start justify-between">
                        <span aria-hidden className="flex size-10 items-center justify-center rounded-[10px] bg-brand-tint text-brand"><Icon size={19} strokeWidth={1.8} /></span>
                        <Heart aria-hidden size={16} className="text-secondary-2" />
                      </div>
                      <span className="text-xs text-secondary-2">AXA Health</span>
                      <span className="font-semibold leading-snug">{f.name}</span>
                      <span className="text-[13px] text-secondary">{f.detail}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
          <Faqs />
        </div>
        <div data-tour="pmi-flex" className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[340px]">
          <FlexPrompt />
          <CoverPanel variant="summary" />
        </div>
      </div>
    </div>
  );
}
