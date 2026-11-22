import { formatAnnual } from '@/lib/engine/format';
import type { ScenarioCardData } from '@/lib/ai/types';

export function ScenarioCard({ card }: { card: ScenarioCardData }) {
  return (
    <div className="flex flex-col gap-1 rounded-[12px] border border-ai-border bg-white px-4 py-3">
      <span className="text-xs font-medium text-ai-text">{card.label}</span>
      <span className="text-2xl font-semibold tracking-tight">{formatAnnual(card.amount)}</span>
      <span className="text-[13px] text-secondary">{card.note}</span>
    </div>
  );
}
