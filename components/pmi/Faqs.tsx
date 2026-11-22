'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { scheme } from '@/lib/data';

/** Generic AXA PMI questions, as on Navigator's benefit pages. Personalised questions live on the cover page. */
export function Faqs() {
  const id = useId();
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (q: string) => setOpen((o) => (o.includes(q) ? o.filter((x) => x !== q) : [...o, q]));
  return (
    <section aria-labelledby={`${id}-faqs`} className="flex flex-col gap-2 rounded-[16px] border border-line bg-white px-6 py-[22px]">
      <h2 id={`${id}-faqs`} className="text-lg">FAQs</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {scheme.faqs.map((f) => {
          const isOpen = open.includes(f.id);
          const panel = `${id}-${f.id}`;
          return (
            <li key={f.id} className="border-t border-divider first:border-t-0">
              <h3 className="text-[15px] font-medium">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => toggle(f.id)}
                  className="flex min-h-11 w-full items-center gap-4 py-4 text-left cursor-pointer"
                >
                  <span className="flex-1 leading-snug">{f.q}</span>
                  <Plus aria-hidden size={20} strokeWidth={1.6} className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-45' : ''}`} />
                </button>
              </h3>
              {isOpen && (
                <p id={panel} className="fade-in -mt-1 pb-4 pr-9 text-sm leading-relaxed text-ink-2">{f.a}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
