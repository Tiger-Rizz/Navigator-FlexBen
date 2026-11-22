'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { employer } from '@/lib/data';
import { formatAnnual } from '@/lib/engine/format';
import { sendMessage } from '@/lib/ai/client';
import { firstName, leverSummary, whoLabel } from '@/lib/plan';
import { relationshipLabel } from '@/lib/engine/rules';
import { usePersona, usePlan } from '@/lib/store';

/** "Here's what I already know" — facts from Meridian, for the member to confirm. */
export function MemberContextCard() {
  const persona = usePersona();
  const { contextConfirmed, setContextConfirmed, busy } = usePlan();
  const family = persona.peopleOnRecord.map((p) => `${firstName(p)} (${relationshipLabel(p.relationship)})`).join(', ') || 'No one';
  const cover = `${leverSummary(persona.currentSelection).split(' · ')[0]}, ${whoLabel(persona.currentSelection, persona.peopleOnRecord).toLowerCase()}`;
  const facts: [string, string][] = [
    ['Age', String(persona.age)],
    ['Home postcode', `${persona.postcode}, ${persona.area}`],
    ['Income tax rate', `${Math.round(persona.taxRate * 100)}%`],
    ['Family on record', family],
    ['Cover today', cover],
    ['Flex Fund', `${formatAnnual(employer.flexFund)} to spend`],
  ];
  const answer = (text: string) => { setContextConfirmed(true); void sendMessage(text); };

  return (
    <div data-tour="member-context" className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ai-bg">
          <Sparkles size={14} strokeWidth={1.8} className="text-ai-icon" />
        </span>
        <p className="leading-relaxed">Hi {persona.firstName}. Before we start, here’s what I already know from Meridian. Is it still right?</p>
      </div>
      <div className="ml-9 flex flex-col gap-3 rounded-[12px] border border-line p-4">
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-xs text-secondary-2">{k}</dt>
              <dd className="m-0 font-medium">{v}</dd>
            </div>
          ))}
          <div className="flex flex-col sm:col-span-2">
            <dt className="text-xs text-secondary-2">You told us you’re focused on</dt>
            <dd className="m-0 font-medium">{persona.focusAreas.join(' · ')}</dd>
          </div>
        </dl>
        {contextConfirmed ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success"><Check aria-hidden size={15} />Confirmed</span>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => answer('Looks right')} disabled={busy}>Looks right</Button>
            <Button variant="secondary" onClick={() => answer('Something’s changed')} disabled={busy}>Something’s changed</Button>
          </div>
        )}
      </div>
    </div>
  );
}
