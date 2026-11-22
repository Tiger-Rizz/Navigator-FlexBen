import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'What would happen if… · Meridian Benefits' };

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        title="What would happen if…"
        intro="Real situations, priced on each plan, so you can choose by what it means for you rather than by the premium alone."
        crumbs={[{ href: '/benefits/pmi', label: 'Private Medical Insurance' }, { label: 'What would happen if…' }]}
      />
      <PageBody>
        <BuildPlaceholder step="6">
          <p>The AI summary, scenario grid and totals go here.</p>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
