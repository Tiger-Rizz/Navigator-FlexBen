import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function AxaTile({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size >= 56 ? 16 : size < 30 ? 9 : 11 }}
      className="flex shrink-0 items-center justify-center rounded-[10px] bg-axa font-bold text-white"
    >
      AXA
    </span>
  );
}

/** Navigator-style benefit header band. `page="cover"` is the flex page under the benefit. */
export function BenefitHeader({ page = 'overview' }: { page?: 'overview' | 'cover' | 'review' }) {
  const cover = page === 'cover';
  const review = page === 'review';
  const sub = cover || review;
  const back = review ? { href: '/benefits/pmi/cover', label: 'Back to your cover' } : cover ? { href: '/benefits/pmi', label: 'Back to Private Medical Insurance' } : { href: '/benefits', label: 'Back to benefits' };
  return (
    <div className="bg-brand-tint px-4 pb-8 pt-6 min-[900px]:px-12 lg:pb-20">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-secondary-2">
          <Link href={back.href} aria-label={back.label} className="-my-3 -ml-2 flex size-11 items-center justify-center rounded-lg text-ink">
            <ArrowLeft aria-hidden size={16} />
          </Link>
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            <li><Link href="/benefits" className="-my-3 inline-flex min-h-11 items-center text-secondary-2">Benefits</Link></li>
            <li aria-hidden>›</li>
            {sub ? (
              <>
                <li><Link href="/benefits/pmi" className="-my-3 inline-flex min-h-11 items-center text-secondary-2">Private Medical Insurance</Link></li>
                <li aria-hidden>›</li>
                {review ? (
                  <>
                    <li><Link href="/benefits/pmi/cover" className="-my-3 inline-flex min-h-11 items-center text-secondary-2">Your cover</Link></li>
                    <li aria-hidden>›</li>
                    <li aria-current="page" className="text-ink">Review</li>
                  </>
                ) : (
                  <li aria-current="page" className="text-ink">Your cover</li>
                )}
              </>
            ) : (
              <li aria-current="page" className="text-ink">Private Medical Insurance</li>
            )}
          </ol>
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <AxaTile size={sub ? 48 : 64} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-secondary">{sub ? 'AXA Health · Private Medical Insurance' : 'AXA Health'}</span>
            <h1 className={sub ? 'text-[24px]' : 'text-[28px]'}>{review ? 'Review and confirm' : cover ? 'Your cover for April 2027 to March 2028' : 'Private Medical Insurance'}</h1>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-success-border bg-white px-3 py-1 text-xs font-medium text-success">
            <span aria-hidden className="size-1.5 rounded-full bg-success" />
            Enrolment open until 31 March
          </span>
        </div>
      </div>
    </div>
  );
}
