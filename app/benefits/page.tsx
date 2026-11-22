import { BenefitsBrowser } from '@/components/home/BenefitsBrowser';

export const metadata = { title: 'Benefits · Meridian Benefits' };

export default function Benefits() {
  return (
    <div className="px-4 pb-16 pt-6 min-[900px]:px-12">
      <BenefitsBrowser />
    </div>
  );
}
