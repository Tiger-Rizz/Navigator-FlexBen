import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function AxaTile({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size < 30 ? 9 : 11 }}
      className="flex shrink-0 items-center justify-center rounded-[7px] bg-axa font-bold text-white"
    >
      AXA
    </span>
  );
}

export function BenefitHeader() {
  return (
    <div className="bg-brand-tint px-4 pb-7 pt-6 min-[900px]:px-12 lg:pb-16">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[13px] text-secondary-2">
        <Link href="/benefits" aria-label="Back to benefits" className="-my-3 -ml-2 flex size-11 items-center justify-center rounded-lg text-ink">
          <ArrowLeft aria-hidden size={16} />
        </Link>
        <ol className="m-0 flex list-none items-center gap-1.5 p-0">
          <li><Link href="/benefits" className="-my-3 inline-flex min-h-11 items-center text-secondary-2">Benefits</Link></li>
          <li aria-hidden>›</li>
          <li aria-current="page">Private Medical Insurance</li>
        </ol>
      </nav>
      <div className="flex flex-wrap items-center gap-3.5">
        <AxaTile size={48} />
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-secondary">AXA Health</span>
          <h1 className="text-[26px]">Private Medical Insurance</h1>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-success-border bg-white px-3 py-1 text-xs font-medium text-success">
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
          Enrolment open until 31 March
        </span>
      </div>
    </div>
  );
}
