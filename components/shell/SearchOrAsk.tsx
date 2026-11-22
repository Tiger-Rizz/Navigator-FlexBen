'use client';

import { Search } from 'lucide-react';
import { usePlan } from '@/lib/store';

/** Opens the Ask AI pop-up. */
export function SearchOrAsk() {
  const openAsk = usePlan((s) => s.openAsk);
  return (
    <button
      type="button"
      onClick={() => openAsk()}
      className="flex min-h-11 w-full items-center gap-2 rounded-[10px] bg-surface-2 px-2.5 py-2 text-left text-[13px] text-secondary-2 cursor-pointer hover:bg-nav-active"
    >
      <Search aria-hidden size={15} strokeWidth={2} />
      Search or ask
    </button>
  );
}
