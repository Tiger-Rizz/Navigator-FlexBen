'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/Button';
import { formatMonthly } from '@/lib/engine/format';
import { addAssistantMessage } from '@/lib/ai/client';
import type { Proposal } from '@/lib/ai/types';
import { usePlan } from '@/lib/store';

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const { proposal: current, proposalStatus, acceptProposal, undoProposal } = usePlan();
  const isCurrent = current?.id === proposal.id;
  const accepted = isCurrent && proposalStatus === 'accepted';
  const superseded = !isCurrent;
  const n = proposal.lines.length;

  const accept = () => {
    if (!isCurrent) usePlan.getState().setProposal(proposal);
    acceptProposal();
    addAssistantMessage([
      { type: 'text', text: 'Done. Before you confirm, want to see how this plan would handle a few real situations, like a knee operation or a flare-up for Sam?' },
      { type: 'actions', items: [{ label: 'Show me scenarios', href: '/benefits/pmi/scenarios' }, { label: 'Go to review', href: '/benefits/pmi/review' }] },
    ]);
  };

  return (
    <div data-tour="proposal" className="flex flex-col gap-3 rounded-[12px] border border-ai-highlight bg-ai-soft p-4">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden size={16} strokeWidth={1.8} className="text-ai-icon" />
        <h3 className="flex-1 text-[15px]">{proposal.title}</h3>
        <span className="text-xs font-medium text-ai-text">{n} {n === 1 ? 'change' : 'changes'}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {proposal.lines.map((l) => (
          <li key={l.text} className="flex gap-2 text-sm">
            <span aria-hidden className="w-4 shrink-0 text-center font-semibold text-ai-text">{l.icon}</span>
            {l.text}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col rounded-[10px] border border-ai-border bg-white px-3 py-2">
          <span className="text-lg font-semibold">{formatMonthly(proposal.monthly)} a month</span>
          <span className="text-xs text-secondary">with these changes</span>
        </div>
        {proposal.alternative && (
          <div className="flex flex-col rounded-[10px] border border-line px-3 py-2">
            <span className="text-lg font-medium text-secondary">{formatMonthly(proposal.alternative.monthly)} a month</span>
            <span className="text-xs text-secondary">{proposal.alternative.label}</span>
          </div>
        )}
      </div>
      {accepted ? (
        <div role="status" className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-success"><Check aria-hidden size={16} />Applied to your plan</span>
          <Button variant="secondary" onClick={undoProposal}>Undo</Button>
        </div>
      ) : superseded && proposalStatus !== null && current ? (
        <p className="text-xs text-secondary-2">Replaced by a newer suggestion.</p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={accept} data-tour="accept-proposal">{n > 1 ? `Accept all ${NUMBER_WORDS[n] ?? n}` : 'Accept'}</Button>
          <Link href="/benefits/pmi/scenarios" className={buttonClass('secondary')}>Compare alternatives</Link>
        </div>
      )}
      {proposal.taxNote && <p className="text-[13px] text-secondary">{proposal.taxNote}</p>}
    </div>
  );
}
