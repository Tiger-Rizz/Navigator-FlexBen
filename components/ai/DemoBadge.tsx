'use client';

import { useEffect, useState } from 'react';

/** Subtle badge when the AI runs on scripted answers (no API key). */
export function DemoBadge() {
  const [scripted, setScripted] = useState(false);
  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d: { live?: boolean }) => setScripted(!d.live))
      .catch(() => setScripted(true));
  }, []);
  if (!scripted) return null;
  return (
    <span title="The AI is using scripted answers. Every number still comes from the pricing engine." className="self-start rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-secondary">
      Demo mode
    </span>
  );
}
