import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'My choices · Meridian Benefits' };

export default function MyChoicesPage() {
  return (
    <>
      <PageHeader title="My choices" intro="Change until 31 March." />
      <PageBody>
        <BuildPlaceholder step="7">
          <p>Your confirmed elections and their effective dates go here.</p>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
