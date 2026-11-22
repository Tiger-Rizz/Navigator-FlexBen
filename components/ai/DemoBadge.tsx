'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Subtle badge when the AI runs on scripted answers (no API key). */
export function DemoBadge() {
  const [scripted, setScripted] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === '/passcode') return; // not signed in yet: the API would answer 401
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d: { live?: boolean }) => setScripted(!d.live))
      .catch(() => setScripted(true));
  }, [pathname]);
  if (!scripted) return null;
  return (
    <span title="Answers are scripted in this demo. Every number still comes from the pricing engine." className="self-start rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-secondary">
      Demo mode
    </span>
  );
}
