import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Notes for reviewers · Meridian Benefits' };

/** Placeholder notes for the author to finish (CLAUDE.md §9). Each "TODO(owner)" is theirs to replace. */
const SECTIONS: { title: string; prompt: string }[] = [
  { title: 'How I read the brief', prompt: 'What the brief asked for, and the problem I decided it was really about.' },
  { title: 'What I researched', prompt: 'Sources on UK PMI, flex schemes, payrolling benefits from April 2027, and what I took from each.' },
  { title: 'Assumptions', prompt: 'The scheme rules, prices, contribution model and persona details I assumed, and why.' },
  { title: 'What’s real vs mocked', prompt: 'Real: the pricing, tax and claims engines, the tool-calling AI and its scripted fallback, the shared plan state. Mocked: the scheme data, prices, HR record, AXA and payroll updates.' },
  { title: 'Key design decisions', prompt: 'The choices that shaped the experience, such as chat and screen sharing one plan, and the AI reasoning while code calculates.' },
  { title: 'What I’d build next', prompt: 'What I would test with members and employers, and what I would build after that.' },
  { title: 'Part 2 ideas', prompt: 'Where this pattern goes beyond PMI.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Notes for reviewers"
        intro="Flex isn’t a form problem, it’s a decision problem. Navigator already helps people understand their benefits; this lets them act, by turning insurance trade-offs into consequences they can see, with an AI that reasons and code that calculates."
      >
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/?tour=1" className={buttonClass('primary')}><Sparkles aria-hidden size={16} strokeWidth={1.8} />Take the guided tour</Link>
          <Link href="/benefits/pmi" className={buttonClass('secondary')}>Explore the PMI page</Link>
        </div>
      </PageHeader>
      <PageBody>
        {SECTIONS.map((s) => (
          <section key={s.title} aria-labelledby={s.title} className="flex max-w-[760px] flex-col gap-2 rounded-[16px] border border-line px-6 py-[22px]">
            <h2 id={s.title} className="text-lg">{s.title}</h2>
            <p className="text-[13px] text-secondary-2">{s.prompt}</p>
            <p className="text-secondary">TODO(owner)</p>
          </section>
        ))}
        <p className="max-w-[760px] text-xs text-secondary-2">
          A fictional prototype. Meridian Group, the scheme and all prices are illustrative. Guidance, not financial advice.
        </p>
      </PageBody>
    </>
  );
}
