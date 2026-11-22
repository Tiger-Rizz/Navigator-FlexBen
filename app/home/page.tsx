import { BenefitRows } from '@/components/home/BenefitRows';
import { HomeHero } from '@/components/home/HomeHero';

export default function Home() {
  return (
    <>
      <HomeHero />
      <div className="rise relative px-4 pb-24 pt-6 min-[900px]:px-12 lg:-mt-14 lg:pt-0">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-10">
          <BenefitRows />
        </div>
      </div>
    </>
  );
}
