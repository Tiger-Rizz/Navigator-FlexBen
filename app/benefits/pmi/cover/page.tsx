import { BenefitHeader } from '@/components/pmi/BenefitHeader';
import { PmiContent } from '@/components/pmi/PmiContent';

export const metadata = { title: 'Your cover · Private Medical Insurance · Meridian Benefits' };

export default function CoverPage() {
  return (
    <>
      <BenefitHeader page="cover" />
      <PmiContent />
    </>
  );
}
