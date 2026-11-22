import Link from 'next/link';
import { ChatThread } from '@/components/ai/ChatThread';
import { LivePlan } from '@/components/chat/LivePlan';

export const metadata = { title: 'Your health cover for April · Meridian Benefits' };

export default function ChatPage() {
  return (
    <div className="rise mx-auto flex max-w-[1276px] flex-col gap-6 px-4 pt-6 min-[900px]:px-12 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-1">
          <Link href="/benefits/pmi/cover" className="-ml-1 inline-flex min-h-11 items-center gap-1 self-start text-[13px] text-secondary-2">‹ Back</Link>
          <h1 className="text-2xl">Your health cover for April</h1>
          <p className="text-[13px] text-secondary">Knows Meridian’s scheme rules and your HR record. Prices and tax are calculated, not guessed.</p>
        </div>
        <ChatThread />
      </div>
      <div className="w-full shrink-0 pb-10 lg:sticky lg:top-6 lg:w-[360px]">
        <LivePlan />
      </div>
    </div>
  );
}
