import Link from 'next/link';
import { AxaTile } from '@/components/pmi/BenefitHeader';

/** Inline link to a benefit feature: AXA tile plus underlined name. */
export function BenefitLink({ name }: { name: string }) {
  return (
    <Link href="/benefits/pmi#features" className="inline-flex min-h-11 items-center gap-2 text-[13px] font-medium underline underline-offset-2">
      <AxaTile size={22} />
      {name}
    </Link>
  );
}
