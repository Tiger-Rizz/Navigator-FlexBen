import { PageBody, PageHeader } from '@/components/shell/PageHeader';
import { ScenarioExplorer } from '@/components/scenarios/ScenarioExplorer';

export const metadata = { title: 'What would happen if… · Meridian Benefits' };

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        title="What would happen if…"
        intro="Real situations, priced on each plan, so you can choose by what it means for you rather than by the premium alone. Picked from what you told us matters, plus anything you mentioned in chat."
        crumbs={[{ href: '/benefits', label: 'Benefits' }, { href: '/benefits/pmi', label: 'Private Medical Insurance' }, { href: '/benefits/pmi/cover', label: 'Your cover' }, { label: 'Compare plans' }]}
      />
      <PageBody>
        <ScenarioExplorer />
      </PageBody>
    </>
  );
}
