import { MyChoicesList } from '@/components/review/MyChoicesList';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'My choices · Meridian Benefits' };

export default function MyChoicesPage() {
  return (
    <>
      <PageHeader title="My choices" intro="Your confirmed elections for 2027–28. You can change them until 31 March." />
      <PageBody>
        <MyChoicesList />
      </PageBody>
    </>
  );
}
