import type { ComponentProps } from 'react';
import { Sparkles } from 'lucide-react';

type Props = ComponentProps<'button'> & { ai?: boolean };

/** Pill-shaped suggestion chip. `ai` adds the sparkle and AI accent. */
export function Chip({ ai, className = '', children, type = 'button', ...rest }: Props) {
  const tone = ai
    ? 'border-ai-border bg-ai-soft text-ai-text hover:bg-ai-bg'
    : 'border-line-control bg-white text-ink hover:bg-surface-2';
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium cursor-pointer ${tone} ${className}`}
      {...rest}
    >
      {ai && <Sparkles aria-hidden size={14} strokeWidth={1.8} className="text-ai-icon" />}
      {children}
    </button>
  );
}
