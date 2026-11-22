'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { employer } from '@/lib/data';
import { daysLeft, relationshipLabel } from '@/lib/engine/rules';
import { firstName } from '@/lib/plan';
import { usePersona, usePlan } from '@/lib/store';

export function ActionCard() {
  const persona = usePersona();
  const { selection, confirmedSelection, status } = usePlan();
  const [reminded, setReminded] = useState(false);
  const partner = persona.peopleOnRecord.find((p) => p.relationship !== 'child');
  const name = partner ? firstName(partner) : '';
  const confirmedWithPartner = !!partner && status === 'confirmed' && !!confirmedSelection?.dependants.includes(partner.id);
  const draftWithPartner = !!partner && selection.dependants.includes(partner.id);

  const side = (
    <div className="flex flex-col gap-3 border-line max-[860px]:border-t max-[860px]:pt-4 min-[860px]:w-[300px] min-[860px]:border-l min-[860px]:pl-6">
      <p className="text-xs font-medium text-secondary-2">Also for you</p>
      <Link href="/benefits/pmi#whats-changed" className="flex items-start gap-2.5 no-underline">
        <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-ai-icon" />
        <span className="leading-normal">What’s changed in your health cover for 2027–28: a higher mental health limit and a new lower-cost option</span>
      </Link>
      {partner && (
        <div className="flex items-start gap-2.5">
          <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-ai-icon" />
          <span className="leading-normal">{name} isn’t named on your life assurance. Check who should receive it.</span>
        </div>
      )}
    </div>
  );

  if (confirmedWithPartner || (status !== 'editing' && !partner)) {
    return (
      <section aria-labelledby="action" className="flex flex-col gap-6 rounded-[16px] border border-success-border bg-white px-6 py-[22px] min-[860px]:flex-row">
        <div className="flex flex-1 flex-col gap-2.5">
          <Badge tone="success" className="self-start"><Check aria-hidden size={12} />Done</Badge>
          <h2 id="action" className="text-[21px]">Your health cover is confirmed for 1 April</h2>
          <p className="text-[15px] text-ink-2">You can still change it until 31 March.</p>
          <Link href="/my-choices" className={buttonClass('secondary', 'self-start')}>See my choices</Link>
        </div>
        {side}
      </section>
    );
  }

  const title = draftWithPartner ? `Finish adding ${name} to your health cover` : `${name} isn’t on your health cover`;
  const body = draftWithPartner
    ? `${name} is in your draft choices, but nothing changes until you confirm. Enrolment closes on 31 March.`
    : `${name} is listed as your ${partner ? relationshipLabel(partner.relationship) : ''}, but he isn’t covered by your AXA Health plan. Enrolment is the main time in the year to add family, and it closes on 31 March. Most people finish in a couple of minutes.`;

  if (!partner) return null;
  return (
    <section aria-labelledby="action" data-tour="home-nudge" className="flex flex-col gap-6 rounded-[16px] border border-ai-border bg-white px-6 py-[22px] min-[860px]:flex-row">
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ai-text"><Sparkles aria-hidden size={15} strokeWidth={1.8} />Action needed</span>
          <Badge tone="warning">Enrolment closes in {daysLeft(employer.demoToday)} days</Badge>
        </div>
        <h2 id="action" className="text-[21px]">{title}</h2>
        <p className="max-w-[560px] text-[15px] leading-relaxed text-ink-2">{body}</p>
        <span className="text-xs text-secondary-2">{name} is listed as a dependant in your HR record</span>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <Link href={draftWithPartner ? '/benefits/pmi/review' : '/benefits/pmi'} className={buttonClass('primary')}>
            {draftWithPartner ? 'Review and confirm' : 'Review my health cover'}<ArrowRight aria-hidden size={16} />
          </Link>
          {reminded ? (
            <span role="status" className="text-[13px] text-secondary">We’ll remind you tomorrow.</span>
          ) : (
            <button type="button" onClick={() => setReminded(true)} className={buttonClass('secondary')}>Remind me tomorrow</button>
          )}
        </div>
      </div>
      {side}
    </section>
  );
}
