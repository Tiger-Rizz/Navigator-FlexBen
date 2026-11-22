import Link from 'next/link';
import { Search } from 'lucide-react';

/** Opens the Ask AI pop-up (built in step 4). For now it goes to the plan builder. */
export function SearchOrAsk() {
  return (
    <Link
      href="/benefits/pmi/chat"
      className="flex min-h-11 items-center gap-2 rounded-[10px] bg-surface-2 px-2.5 py-2 text-[13px] text-secondary-2 no-underline hover:bg-nav-active"
    >
      <Search aria-hidden size={15} strokeWidth={2} />
      Search or ask
    </Link>
  );
}
