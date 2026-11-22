import { BenefitRows } from '@/components/home/BenefitRows';
import { HomeHero } from '@/components/home/HomeHero';

export default function Home() {
  return (
    <>
      <HomeHero />
      <div className="flex flex-col gap-8 px-4 pb-14 pt-7 min-[900px]:px-12">
        <BenefitRows />
      </div>
    </>
  );
}
