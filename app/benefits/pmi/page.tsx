import { BenefitHeader } from '@/components/pmi/BenefitHeader';
import { PmiContent } from '@/components/pmi/PmiContent';

export const metadata = { title: 'Private Medical Insurance · Meridian Benefits' };

export default function PmiPage() {
  return (
    <>
      <BenefitHeader />
      <PmiContent />
    </>
  );
}
