'use client';

import Link from 'next/link';
import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { employer, scheme, type Dependant } from '@/lib/data';
import { monthlyDifference } from '@/lib/engine/pricing';
import { perMonth } from '@/lib/engine/format';
import { ageOn, checkEligibility, validateDob } from '@/lib/engine/rules';
import { firstName, personLabel, sameDependants } from '@/lib/plan';
import { baseline, usePeople, usePersona, usePlan } from '@/lib/store';

type Rel = 'child' | 'partner' | 'parent' | 'other';
const RELS: { value: Rel; label: string }[] = [
  { value: 'child', label: 'Child' },
  { value: 'partner', label: 'Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Someone else' },
];

function Avatar({ initials, muted }: { initials: string; muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${muted ? 'border border-dashed border-line-control bg-white text-secondary' : 'bg-avatar text-avatar-text'}`}
    >
      {initials}
    </span>
  );
}

const initialsOf = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export interface WhosCoveredHandle {
  startAdding: () => void;
}

export const WhosCovered = forwardRef<WhosCoveredHandle>(function WhosCovered(_, ref) {
  const persona = usePersona();
  const people = usePeople();
  const { selection, cover, uncover, addChild } = usePlan();
  const [adding, setAdding] = useState(false);
  const [rel, setRel] = useState<Rel | null>(null);
  const addRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    startAdding: () => {
      setAdding(true);
      setRel(null);
      requestAnimationFrame(() => {
        addRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        addRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
      });
    },
  }));

  const costToAdd = (id: string) =>
    monthlyDifference(selection, { ...selection, dependants: [...selection.dependants, id] }, people, persona.taxRate);

  const changed = !sameDependants(baseline, selection);
  const onRecord = persona.peopleOnRecord;
  const added = people.filter((p) => p.source === 'added_by_member');
  const existingForPartnerRule = people.filter((p) => p.relationship !== 'child');

  return (
    <div className="flex flex-col gap-3" data-tour="whos-covered">
      <div className="flex items-center gap-2">
        <h3 className="text-[15px]">Who’s covered</h3>
        {changed && <Badge tone="ai">Changed</Badge>}
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        <li className="flex items-center gap-3 rounded-[12px] border border-line px-3.5 py-2.5">
          <Avatar initials={persona.initials} />
          <span className="flex flex-col">
            <span className="font-medium">{persona.name}</span>
            <span className="text-xs text-secondary-2">You · always covered</span>
          </span>
        </li>

        {[...onRecord, ...added].map((p: Dependant) => {
          const covered = selection.dependants.includes(p.id);
          return covered ? (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line px-3.5 py-2.5">
              <Avatar initials={initialsOf(p.name)} />
              <span className="flex flex-1 flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-secondary-2">{personLabel(p)}</span>
              </span>
              <Button variant="secondary" onClick={() => uncover(p.id)} aria-label={`Remove ${firstName(p)}`}>
                Remove
              </Button>
            </li>
          ) : (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-dashed border-line-control px-3.5 py-2.5">
              <Avatar initials={initialsOf(p.name)} muted />
              <span className="flex flex-1 flex-col">
                <span className="font-medium text-secondary">{p.name}</span>
                <span className="text-xs text-secondary-2">{personLabel(p)} · not covered</span>
              </span>
              <Button variant="secondary" onClick={() => cover(p.id)} data-tour="add-sam">
                Add · {perMonth(costToAdd(p.id))}
              </Button>
            </li>
          );
        })}
      </ul>

      {!adding ? (
        <button
          type="button"
          onClick={() => { setAdding(true); setRel(null); }}
          className="flex min-h-11 items-center gap-2 self-start rounded-[10px] px-2 font-medium cursor-pointer hover:bg-surface-2"
        >
          <span aria-hidden className="text-lg leading-none">+</span>Add someone
        </button>
      ) : (
        <div ref={addRef} className="flex flex-col gap-3.5 rounded-[12px] border border-line bg-[#FBFBFA] p-4">
          <Segmented label="Who would you like to add?" options={RELS} value={rel ?? ('' as Rel)} onChange={setRel} />
          {rel === 'child' && (
            <ChildForm
              costFor={() => monthlyDifference(selection, { ...selection, dependants: [...selection.dependants, '__new'] }, [...people, { id: '__new', name: 'x', relationship: 'child', source: 'added_by_member' }], persona.taxRate)}
              onAdd={(name, dob) => { addChild(name, dob); setAdding(false); setRel(null); }}
            />
          )}
          {rel === 'partner' && (
            <p className="text-secondary">{checkEligibility({ relationship: 'spouse', existing: existingForPartnerRule }).explanation}</p>
          )}
          {(rel === 'parent' || rel === 'other') && (
            <div className="flex flex-col gap-2">
              <p className="text-secondary">{scheme.rules.copy.notEligible}</p>
              <Link href="/benefits/pmi/chat" className="self-start font-medium text-ai-text">Talk through other options</Link>
            </div>
          )}
          <div>
            <Button variant="secondary" onClick={() => { setAdding(false); setRel(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <p className="text-[13px] text-secondary">{scheme.rules.medicalHistoryDisregarded}</p>
    </div>
  );
});

function ChildForm({ costFor, onAdd }: { costFor: () => number; onAdd: (name: string, dobIso: string) => void }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [ftEducation, setFtEducation] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; dob?: string }>({});
  const id = useId();

  const submit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Enter your child’s first name to add them.';
    const d = validateDob(dob);
    if (!d.ok) next.dob = d.error === 'future' ? 'Date of birth can’t be in the future.' : 'Enter a date of birth as DD/MM/YYYY.';
    else {
      const age = ageOn(d.iso, employer.coverYear.starts);
      const e = checkEligibility({ relationship: 'child', age, inFullTimeEducation: ftEducation });
      if (!e.eligible) next.dob = e.explanation;
    }
    setErrors(next);
    if (!next.name && !next.dob && d.ok) onAdd(name, d.iso);
  };

  const field = (err?: string) =>
    `min-h-11 rounded-[10px] border px-3 py-2.5 ${err ? 'border-error' : 'border-line-control'} bg-white`;

  return (
    <form className="flex flex-col gap-3" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="flex flex-wrap gap-3">
        <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 text-[13px] font-medium">
          First name
          <input
            className={field(errors.name)}
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name` : undefined}
            autoComplete="off"
          />
          {errors.name && <span id={`${id}-name`} className="font-normal text-error">{errors.name}</span>}
        </label>
        <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 text-[13px] font-medium">
          Date of birth
          <input
            className={field(errors.dob)}
            value={dob}
            placeholder="DD/MM/YYYY"
            inputMode="numeric"
            onChange={(e) => { setDob(e.target.value); setErrors((x) => ({ ...x, dob: undefined })); }}
            aria-invalid={!!errors.dob}
            aria-describedby={`${id}-dob-hint${errors.dob ? ` ${id}-dob` : ''}`}
          />
          <span id={`${id}-dob-hint`} className="sr-only">Format DD/MM/YYYY</span>
          {errors.dob && <span id={`${id}-dob`} className="font-normal text-error">{errors.dob}</span>}
        </label>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-[13px]">
        <input type="checkbox" className="size-4" checked={ftEducation} onChange={(e) => setFtEducation(e.target.checked)} />
        In full-time education
      </label>
      <p className="text-[13px] text-secondary">{scheme.rules.copy.child}</p>
      <div>
        <Button type="submit">Add child · {perMonth(costFor())}</Button>
      </div>
    </form>
  );
}
