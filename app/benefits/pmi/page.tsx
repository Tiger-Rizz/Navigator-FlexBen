import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';
import { getPersona } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { perMonth } from '@/lib/engine/format';

export const metadata = { title: 'Private Medical Insurance · Meridian Benefits' };

export default function PmiPage() {
  const priya = getPersona('priya');
  const now = price(priya.currentSelection, priya.peopleOnRecord, priya.taxRate);
  return (
    <>
      <PageHeader tint title="Private Medical Insurance" crumbs={[{ href: '/benefits', label: 'Benefits' }, { label: 'Private Medical Insurance' }]}>
        <div className="mt-3 flex items-center gap-3">
          <span aria-hidden className="flex size-9 items-center justify-center rounded-[7px] bg-axa text-[11px] font-bold text-white">AXA</span>
          <span className="text-[13px] text-secondary">AXA Health</span>
          <Badge tone="success">Enrolment open until 31 March</Badge>
        </div>
      </PageHeader>
      <PageBody>
        <BuildPlaceholder step="3">
          <p>Quick choices, who’s covered, fine-tune, what’s changed, features, common questions and the cover panel go here.</p>
          <p>
            Keeping your current cover: <strong className="text-ink">{perMonth(now.realMonthlyCost)}</strong> (from the pricing engine).
          </p>
          <div className="flex flex-wrap gap-2.5">
            <LinkButton href="/benefits/pmi/chat" variant="secondary">Help me choose</LinkButton>
            <LinkButton href="/benefits/pmi/scenarios" variant="secondary">What would happen if…</LinkButton>
            <LinkButton href="/benefits/pmi/review">Review and confirm</LinkButton>
          </div>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
