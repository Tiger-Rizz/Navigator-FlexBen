import type { ReactNode } from 'react';

/** Renders model text safely: paragraphs, "- " bullet lists and **bold**, in case the model uses Markdown anyway. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith('**') && chunk.endsWith('**') ? <strong key={i} className="font-semibold">{chunk.slice(2, -2)}</strong> : chunk,
  );
}

export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) {
          return (
            <ul key={i} className="m-0 flex list-disc flex-col gap-1 pl-5 leading-relaxed">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•*]\s+/, ''))}</li>)}
            </ul>
          );
        }
        return <p key={i} className="whitespace-pre-line leading-relaxed">{inline(block.replace(/^#+\s*/gm, ''))}</p>;
      })}
    </>
  );
}
