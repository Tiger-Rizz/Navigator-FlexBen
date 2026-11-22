'use client';

import type { Selection } from '@/lib/data';
import { coveredPeople, whoLabel } from '@/lib/plan';
import { usePeople, usePersona } from '@/lib/store';

const initialsOf = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

/**
 * Who's covered as overlapping initials plus "You and Sam". Pass `before` to show a suggested change:
 * people being added get the purple highlight and the old label is struck through.
 */
export function CoveredPeople({ selection, before }: { selection: Selection; before?: Selection }) {
  const persona = usePersona();
  const people = usePeople();
  const after = whoLabel(selection, people);
  const was = before ? whoLabel(before, people) : after;
  const changed = was !== after;
  const avatars = [
    { id: persona.id, name: persona.name, added: false },
    ...coveredPeople(selection, people).map((p) => ({ id: p.id, name: p.name, added: !!before && !before.dependants.includes(p.id) })),
  ];
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="flex -space-x-2">
        {avatars.map((a) => (
          <span
            key={a.id}
            className={`flex size-8 items-center justify-center rounded-full border-2 text-[11px] font-semibold ${a.added ? 'border-ai-highlight bg-ai-bg text-ai-text' : 'border-white bg-avatar text-avatar-text'}`}
          >
            {initialsOf(a.name)}
          </span>
        ))}
      </span>
      <span className="text-sm">
        <span className="sr-only">Who’s covered: </span>
        {changed && <del className="mr-1.5 text-secondary-2">{was}</del>}
        {changed && <span className="sr-only">changes to </span>}
        <span className={changed ? 'font-semibold text-ai-text' : 'font-medium'}>{after}</span>
      </span>
    </div>
  );
}
