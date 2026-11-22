import { LinkButton } from '@/components/ui/Button';
import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody } from '@/components/shell/PageHeader';

export default function Home() {
  return (
    <>
      <section aria-labelledby="hello" className="flex flex-col items-center gap-1 bg-brand-tint px-4 pb-11 pt-12 min-[900px]:px-12">
        <p className="text-[15px] text-ink-2">Hi Priya,</p>
        <h1 id="hello" className="text-2xl">Ready to explore your benefits?</h1>
      </section>
      <PageBody>
        <BuildPlaceholder step="8">
          <p>The AI input, the “Action needed” enrolment card and the benefit rows go here.</p>
          <div>
            <LinkButton href="/benefits/pmi">Review my health cover</LinkButton>
          </div>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
