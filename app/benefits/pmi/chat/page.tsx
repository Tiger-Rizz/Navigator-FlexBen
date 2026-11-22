import { BuildPlaceholder } from '@/components/shell/BuildPlaceholder';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Your health cover for April · Meridian Benefits' };

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Your health cover for April"
        intro="Knows Meridian’s scheme rules and your HR record. Prices and tax are calculated, not guessed."
        crumbs={[{ href: '/benefits/pmi', label: 'Private Medical Insurance' }, { label: 'Help me choose' }]}
      />
      <PageBody>
        <BuildPlaceholder step="5">
          <p>The conversation, member context card, proposal card and live plan go here.</p>
        </BuildPlaceholder>
      </PageBody>
    </>
  );
}
