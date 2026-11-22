'use client';

import { useId } from 'react';

export interface SegmentedOption<V extends string | number> {
  value: V;
  label: string;
}

interface Props<V extends string | number> {
  label: string;
  options: SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  hideLabel?: boolean;
}

/** A group of toggle buttons (aria-pressed), styled like the design's option rows. */
export function Segmented<V extends string | number>({ label, options, value, onChange, hideLabel }: Props<V>) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2">
      <span id={id} className={hideLabel ? 'sr-only' : 'text-[13px] font-medium'}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              className={`min-h-11 rounded-[10px] border px-3.5 py-2.5 text-sm cursor-pointer ${
                on ? 'border-ink bg-ink font-medium text-white' : 'border-line-control bg-white text-ink hover:bg-surface-2'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
