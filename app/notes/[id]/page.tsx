import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play } from 'lucide-react';
import { notes } from '@/lib/data';

export function generateStaticParams() {
  return notes.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = notes.find((n) => n.id === id);
  return { title: note ? `${note.title} · Notes` : 'Notes' };
}

/** Notes pages (PART2.md §1, Notes.dc.html): note tabs on the left, the article on the right. */
export default async function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = notes.find((n) => n.id === id);
  if (!note) notFound();

  return (
    <div className="min-h-screen bg-[#F7F8F6] px-4 pb-16 pt-10 sm:px-8">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <Link href="/" className="inline-flex min-h-11 items-center self-start text-[13px] text-secondary-2 no-underline hover:text-ink">← Demo room</Link>
        <div className="flex flex-col gap-7 md:flex-row md:items-start">
          <nav aria-label="Notes" className="flex flex-col gap-1.5 md:sticky md:top-6 md:w-[240px] md:shrink-0">
            <span className="px-2.5 pb-1.5 text-xs text-secondary-2">Read my notes</span>
            {notes.map((n) => {
              const on = n.id === note.id;
              return (
                <Link
                  key={n.id}
                  href={`/notes/${n.id}`}
                  aria-current={on ? 'page' : undefined}
                  className={`flex flex-col gap-0.5 rounded-[12px] border px-3 py-3 text-ink no-underline ${on ? 'border-line-control bg-white' : 'border-transparent hover:bg-white/60'}`}
                >
                  <span className="text-[11px] font-semibold" style={{ color: n.color }}>{n.kicker}</span>
                  <span className="text-sm font-medium">{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <article className="flex min-w-0 flex-1 flex-col gap-[26px] rounded-[20px] border border-[#E6E8E4] bg-white px-6 py-8 sm:px-10 sm:py-9">
            <header className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold tracking-[0.02em]" style={{ color: note.color }}>{note.kicker}</span>
              <h1 className="text-[30px] tracking-[-0.02em]">{note.title}</h1>
              <p className="text-[17px] leading-[1.6] text-ink-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{note.thesis}</p>
              <div className="mt-1.5 flex flex-wrap gap-2.5">
                <Link href={note.tourHref} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-ink px-4 py-[11px] font-medium text-white no-underline">
                  <Play aria-hidden size={12} fill="currentColor" />Take the guided tour
                </Link>
              </div>
            </header>
            {note.sections.map((s) => (
              <section key={s.heading} className="flex flex-col gap-2.5 border-t border-divider pt-[22px]">
                <h2 className="text-[17px]">{s.heading}</h2>
                {s.items.map((it) => (
                  <p key={it} className="flex gap-2.5 text-sm leading-[1.65] text-[#2E2E2E]">
                    {s.items.length > 1 && <span aria-hidden className="shrink-0 text-[#767676]">•</span>}
                    <span>{it}</span>
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}
