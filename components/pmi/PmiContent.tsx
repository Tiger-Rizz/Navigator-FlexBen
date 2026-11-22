'use client';

import { useRef } from 'react';
import { CommonQuestions } from './CommonQuestions';
import { CoverPanel } from './CoverPanel';
import { FeatureGrid } from './FeatureGrid';
import { FineTune } from './FineTune';
import { MobileCostBar } from './MobileCostBar';
import { KeptBanner, QuickChoices } from './QuickChoices';
import { WhatsChanged } from './WhatsChanged';
import { WhosCovered, type WhosCoveredHandle } from './WhosCovered';

/** The flex page: choose who's covered and how, with the real cost always in view. */
export function PmiContent() {
  const who = useRef<WhosCoveredHandle>(null);
  return (
    <div className="rise relative px-4 pb-28 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <KeptBanner />
          <section aria-label="Quick choices" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-6 py-5">
            <p className="text-[13px] text-secondary">Most people keep their cover or add family. Everything else is optional.</p>
            <QuickChoices onAddFamily={() => who.current?.startAdding()} />
          </section>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <section aria-label="Who’s covered" className="rounded-[16px] border border-line bg-white px-6 py-[22px]">
              <WhosCovered ref={who} />
            </section>
            <WhatsChanged />
          </div>
          <FineTune />
          <FeatureGrid />
          <CommonQuestions />
        </div>
        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[320px]">
          <CoverPanel />
        </div>
      </div>
      <MobileCostBar />
    </div>
  );
}
