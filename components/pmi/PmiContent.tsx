'use client';

import { useRef } from 'react';
import { CommonQuestions } from './CommonQuestions';
import { CoverPanel } from './CoverPanel';
import { FeatureGrid } from './FeatureGrid';
import { FineTune } from './FineTune';
import { NudgeCard } from './NudgeCard';
import { KeptBanner, QuickChoices } from './QuickChoices';
import { WhatsChanged } from './WhatsChanged';
import { WhosCovered, type WhosCoveredHandle } from './WhosCovered';

export function PmiContent() {
  const who = useRef<WhosCoveredHandle>(null);
  return (
    <div className="flex flex-col gap-5 px-4 pb-24 pt-6 min-[900px]:px-12 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <NudgeCard />
        <KeptBanner />
        <section aria-labelledby="your-cover" className="flex flex-col gap-5 rounded-[16px] border border-line px-6 py-[22px]">
          <div className="flex flex-col gap-1">
            <h2 id="your-cover" className="text-lg">Your cover for April 2027 to March 2028</h2>
            <p className="text-[13px] text-secondary">Most people keep their cover or add family. Everything else is optional.</p>
          </div>
          <QuickChoices onAddFamily={() => who.current?.startAdding()} />
          <WhosCovered ref={who} />
          <FineTune />
        </section>
        <WhatsChanged />
        <FeatureGrid />
        <CommonQuestions />
      </div>
      <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[340px]">
        <CoverPanel />
      </div>
    </div>
  );
}
