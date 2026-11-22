import type { ComponentProps } from 'react';

type Props = ComponentProps<'section'> & { inner?: boolean; ai?: boolean };

/** Cards: 16px radius, #ECECEC border, 22–26px padding. `inner` for nested 12px cards; `ai` for AI-accent cards. */
export function Card({ inner, ai, className = '', ...rest }: Props) {
  const radius = inner ? 'rounded-[12px] p-4' : 'rounded-[16px] px-6 py-[22px]';
  const border = ai ? 'border-ai-border' : 'border-line';
  return <section className={`border bg-white ${border} ${radius} ${className}`} {...rest} />;
}
