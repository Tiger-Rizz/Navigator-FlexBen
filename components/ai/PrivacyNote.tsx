import { Lock } from 'lucide-react';

export function PrivacyNote({ text = 'This stays between you and Navigator. Meridian never sees it.' }: { text?: string }) {
  return (
    <p data-tour="privacy" className="flex items-start gap-1.5 py-0.5 text-xs text-success">
      <Lock aria-hidden size={13} strokeWidth={1.8} className="mt-0.5 shrink-0" />
      {text}
    </p>
  );
}
