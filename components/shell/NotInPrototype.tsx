import { LinkButton } from '@/components/ui/Button';
import { PageBody, PageHeader } from './PageHeader';

/** Tidy placeholder for Navigator areas outside this prototype. */
export function NotInPrototype({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <PageBody>
        <div className="flex max-w-[560px] flex-col items-start gap-3 rounded-[16px] border border-line px-6 py-[22px]">
          <h2 className="text-lg">Not part of this prototype</h2>
          <p className="text-secondary">
            {title} is part of Navigator, but this prototype focuses on choosing your private medical insurance during enrolment.
          </p>
          <LinkButton href="/benefits/pmi" variant="secondary">Go to Private Medical Insurance</LinkButton>
        </div>
      </PageBody>
    </>
  );
}
