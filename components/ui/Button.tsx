import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

const base =
  'inline-flex items-center justify-center gap-2 min-h-11 px-[18px] py-3 rounded-[10px] text-sm font-medium no-underline cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white border border-ink hover:bg-black',
  secondary: 'bg-white text-ink border border-line-control hover:bg-surface-2',
};

export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant };
export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

type LinkButtonProps = { href: string; variant?: Variant; className?: string; children: ReactNode };
export function LinkButton({ href, variant = 'primary', className = '', children }: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
