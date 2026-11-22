import { ArrowRight, Sparkles } from 'lucide-react';
import { planYears } from '@/lib/data';
import { SourceLine } from '@/components/ai/SourceLine';

export function WhatsChanged() {
  return (
    <section aria-labelledby="whats-changed" data-tour="whats-changed" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <h2 id="whats-changed" className="flex items-center gap-2 text-lg"><Sparkles aria-hidden size={16} strokeWidth={1.8} className="text-ai-icon" />What’s changed since last year</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {planYears.differences.map((d) => (
          <li key={d.id} className="flex flex-col gap-0.5 border-t border-divider py-3 first:border-t-0 first:pt-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{d.label}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-[13px]">
                <span className="text-secondary">{d.from}</span>
                <ArrowRight aria-label="to" size={12} className="text-secondary-2" />
                <span className={d.improved ? 'rounded-[5px] bg-success-bg px-1.5 py-0.5 font-semibold text-success' : 'font-medium'}>{d.to}</span>
              </span>
            </div>
            <span className="text-[13px] text-secondary">{d.note}</span>
          </li>
        ))}
      </ul>
      <SourceLine>{planYears.source}</SourceLine>
    </section>
  );
}
