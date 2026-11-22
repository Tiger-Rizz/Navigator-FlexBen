import { Sparkles } from 'lucide-react';
import { planYears } from '@/lib/data';
import { SourceLine } from '@/components/ai/SourceLine';

export function WhatsChanged() {
  return (
    <section id="whats-changed-section" aria-labelledby="whats-changed" data-tour="whats-changed" className="flex flex-col gap-3 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <h2 id="whats-changed" className="flex items-center gap-2 text-lg"><Sparkles aria-hidden size={16} strokeWidth={1.8} className="text-ai-icon" />What’s changed since last year</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {planYears.differences.map((d) => (
          <li key={d.id} className="grid grid-cols-1 gap-1 border-t border-divider py-3 first:border-t-0 sm:grid-cols-[1.3fr_1fr_1.2fr] sm:items-baseline sm:gap-4">
            <span className="font-medium">{d.label}</span>
            <span>
              <span className="text-secondary">{d.from}</span>
              <span aria-label=" to " className="text-secondary-2"> → </span>
              <span className={d.improved ? 'font-semibold text-success' : 'font-medium'}>{d.to}</span>
            </span>
            <span className="text-[13px] text-secondary">{d.note}</span>
          </li>
        ))}
      </ul>
      <SourceLine>{planYears.source}</SourceLine>
    </section>
  );
}
