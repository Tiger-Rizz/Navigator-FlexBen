import Link from 'next/link';
import { PageBody, PageHeader } from '@/components/shell/PageHeader';

export const metadata = { title: 'Your pay, explained · Meridian Benefits' };

export default function PayPage() {
  return (
    <>
      <PageHeader title="Your pay, explained" intro="April 2027 payslip · paid 30 April" />
      <PageBody>
        <div className="flex max-w-[560px] flex-col items-start gap-2 rounded-[16px] border border-line px-6 py-[22px]">
          <p className="text-secondary">This feature is coming to the prototype next.</p>
          <Link href="/notes/pay" className="inline-flex min-h-11 items-center font-medium text-ai-text underline underline-offset-2">Read my notes on it</Link>
        </div>
      </PageBody>
    </>
  );
}
