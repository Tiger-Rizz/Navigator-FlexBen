import { BenefitHeader } from '@/components/pmi/BenefitHeader';
import { PmiOverview } from '@/components/pmi/PmiOverview';

export const metadata = { title: 'Private Medical Insurance · Meridian Benefits' };

export default function PmiPage() {
  return (
    <>
      <BenefitHeader />
      <PmiOverview />
    </>
  );
}
