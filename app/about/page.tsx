import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Notes for reviewers · Meridian Benefits' };

const SECTIONS = [
  'How I read the brief',
  'What I researched',
  'Assumptions',
  'What’s real vs mocked',
  'Key design decisions',
  'What I’d build next',
  'Part 2 ideas',
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Notes for reviewers"
        intro="Flex isn’t a form problem, it’s a decision problem. Navigator already helps people understand their benefits; this lets them act, by turning insurance trade-offs into consequences they can see, with an AI that reasons and code that calculates."
      />
      <PageBody>
        {SECTIONS.map((s) => (
          <section key={s} className="flex max-w-[720px] flex-col gap-2 rounded-[16px] border border-line px-6 py-[22px]">
            <h2 className="text-lg">{s}</h2>
            <p className="text-secondary">TODO(owner)</p>
          </section>
        ))}
      </PageBody>
    </>
  );
}
