import { planYears } from '@/lib/data';
import { SourceLine } from '@/components/ai/SourceLine';

export function WhatsChanged() {
  return (
    <section aria-labelledby="whats-changed" data-tour="whats-changed" className="flex flex-col gap-4 rounded-[16px] border border-line px-6 py-[22px]">
      <h2 id="whats-changed" className="text-lg">What’s changed since last year</h2>
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
        {planYears.differences.map((d) => (
          <li key={d.id} className="flex flex-col gap-1 rounded-[12px] border border-line p-3.5">
            <span className="text-[13px] text-secondary">{d.label}</span>
            <span className="text-[15px]">
              <span className="text-secondary">{d.from}</span>
              <span aria-label=" to "> → </span>
              <span className={d.improved ? 'font-semibold text-success' : 'font-medium'}>{d.to}</span>
            </span>
            <span className="text-xs text-secondary-2">{d.note}</span>
          </li>
        ))}
      </ul>
      <SourceLine>{planYears.source}</SourceLine>
    </section>
  );
}
