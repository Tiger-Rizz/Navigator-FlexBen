import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

export function SourceLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-secondary-2">
      <FileText aria-hidden size={13} strokeWidth={1.8} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
