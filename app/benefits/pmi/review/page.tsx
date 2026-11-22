import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Review your health cover · Meridian Benefits' };

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        title="Review your health cover"
        intro="Check the details, then confirm. You can still change your mind until 31 March."
        crumbs={[{ href: '/benefits/pmi', label: 'Private Medical Insurance' }, { label: 'Review' }]}
      />
      <PageBody>
        <BuildPlaceholder step="7">
          <p>What’s changing, dependant details, before you confirm, the payslip preview and the confirmed state go here.</p>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
