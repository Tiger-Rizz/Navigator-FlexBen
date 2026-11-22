import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Benefits · Meridian Benefits' };

const STATIC = [
  { provider: 'Legal & General', name: 'Life Assurance', detail: '4× salary', band: 'bg-[#E6E6E3]', logo: <span className="text-sm font-semibold text-ink-2">Legal &amp; General</span> },
  { provider: 'Meridian Group', name: 'Flex Fund 2027–28', detail: 'Not yet allocated', band: 'bg-brand-tint', logo: <span className="text-[19px] font-semibold text-brand">£500</span> },
  { provider: 'Aviva', name: 'Pension', detail: 'Meridian pays 8%', band: 'bg-[#F3E9D8]', logo: <span className="text-sm font-semibold text-avatar-text">Aviva</span> },
];

export default function Benefits() {
  return (
    <>
      <PageHeader title="Benefits" />
      <PageBody>
        <ul className="m-0 grid list-none grid-cols-1 gap-3.5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <Link href="/benefits/pmi" className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line no-underline hover:border-line-control">
              <div className="flex h-[78px] items-center justify-center bg-[#DCE3F5]">
                <span className="rounded-[6px] bg-axa px-[11px] py-[9px] text-base font-bold text-white">AXA</span>
              </div>
              <div className="flex flex-col gap-1 px-[15px] py-[13px]">
                <span className="text-xs text-secondary-2">AXA Health</span>
                <span className="font-semibold">Private Medical Insurance</span>
                <Badge tone="warning" className="self-start">Action needed</Badge>
              </div>
            </Link>
          </li>
          {STATIC.map((b) => (
            <li key={b.name} className="flex flex-col overflow-hidden rounded-[14px] border border-line">
              <div className={`flex h-[78px] items-center justify-center ${b.band}`}>{b.logo}</div>
              <div className="flex flex-col gap-1 px-[15px] py-[13px]">
                <span className="text-xs text-secondary-2">{b.provider}</span>
                <span className="font-semibold">{b.name}</span>
                <span className="text-[13px] text-ink-2">{b.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
