import Link from 'next/link';
import type { ReactNode } from 'react';

interface Crumb { href?: string; label: string }

/** Page title block with an optional breadcrumb. `tint` uses the brand-tint band. */
export function PageHeader({ title, intro, crumbs, tint, children }: { title: string; intro?: ReactNode; crumbs?: Crumb[]; tint?: boolean; children?: ReactNode }) {
  return (
    <div className={`${tint ? 'bg-brand-tint pb-7' : 'pb-0'} px-4 pt-8 min-[900px]:px-12`}>
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-secondary-2">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>›</span>}
                {c.href ? <Link href={c.href} className="-my-3 inline-flex min-h-11 items-center text-secondary-2">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="text-[26px]">{title}</h1>
      {intro && <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-ink-2">{intro}</p>}
      {children}
    </div>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5 px-4 pb-14 pt-7 min-[900px]:px-12">{children}</div>;
}
