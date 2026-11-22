/** Pure helpers that describe a selection for the UI and the AI. No money is calculated here. */
import { scheme, type Dependant, type Feature, type FeatureStatus, type Selection } from '@/lib/data';
import { relationshipLabel } from '@/lib/engine/rules';

export type Lever = 'tier' | 'excess' | 'outpatient' | 'specialist';
export const LEVERS: Lever[] = ['tier', 'excess', 'outpatient', 'specialist'];
export const LEVER_LABEL: Record<Lever, string> = {
  tier: 'Cover level',
  excess: 'Excess',
  outpatient: 'Outpatient allowance',
  specialist: 'Choosing your specialist',
};

export function optionFor(lever: Lever, value: Selection[Lever]) {
  const opt = (scheme.options[lever] as { value: unknown; label: string; summary: string; hint: string }[]).find((o) => o.value === value);
  if (!opt) throw new Error(`Option not offered: ${lever}=${String(value)}`);
  return opt;
}

/** Display value used in plan rows ("£250", "Up to £1,000", "Guided by AXA"). */
export function leverValueLabel(lever: Lever, value: Selection[Lever]): string {
  if (lever === 'outpatient') return value === 'full' ? 'Paid in full' : `Up to ${optionFor(lever, value).label}`;
  return optionFor(lever, value).label;
}

export function firstName(p: { name: string }) {
  return p.name.split(' ')[0];
}

export function coveredPeople(selection: Selection, people: Dependant[]) {
  return people.filter((p) => selection.dependants.includes(p.id));
}

/** "Just you", "You and Sam", "You, Sam and Asha" */
export function whoLabel(selection: Selection, people: Dependant[]): string {
  const names = coveredPeople(selection, people).map(firstName);
  if (names.length === 0) return 'Just you';
  if (names.length === 1) return `You and ${names[0]}`;
  return `You, ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Lower-cases only the first letter: "You and Sam" → "you and Sam". */
export const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** The plan as short chips: "Core cover", "£250 excess", "£1,000 outpatient", "Specialist guided by AXA". */
export function planChips(s: Selection): string[] {
  const spec = optionFor('specialist', s.specialist).summary;
  return [
    `${optionFor('tier', s.tier).label} cover`,
    `${optionFor('excess', s.excess).label} excess`,
    s.outpatient === 'full' ? 'Outpatient in full' : `${optionFor('outpatient', s.outpatient).label} outpatient`,
    spec.charAt(0).toUpperCase() + spec.slice(1),
  ];
}

/** "Core · £0 excess · £1,000 outpatient allowance · your choice of specialist" */
export function leverSummary(s: Selection): string {
  return LEVERS.map((l) => optionFor(l, s[l]).summary).join(' · ');
}

export function sameDependants(a: Selection, b: Selection) {
  return a.dependants.length === b.dependants.length && a.dependants.every((d) => b.dependants.includes(d));
}

export function changedLevers(a: Selection, b: Selection): Lever[] {
  return LEVERS.filter((l) => a[l] !== b[l]);
}

/** Number of changes to confirm: each lever that differs, plus one if who's covered differs. */
export function countChanges(base: Selection, s: Selection): number {
  return changedLevers(base, s).length + (sameDependants(base, s) ? 0 : 1);
}

export function sameSelection(a: Selection, b: Selection) {
  return countChanges(a, b) === 0;
}

export function personLabel(p: Dependant) {
  const rel = relationshipLabel(p.relationship);
  return `${rel.charAt(0).toUpperCase()}${rel.slice(1)} · ${p.source === 'hr_record' ? 'from your HR record' : 'added by you'}`;
}

// ---- Features ----
export interface FeatureView {
  id: string;
  name: string;
  detail: string;
  status: FeatureStatus;
  relevant: boolean;
  changed: boolean;
  /** Detail and status on the base selection (today's cover), for was → now comparisons. */
  wasDetail: string;
  wasStatus: FeatureStatus;
}

function resolve<T>(v: T | Record<string, T>, f: Feature, s: Selection): T {
  if (typeof v !== 'object' || v === null) return v as T;
  const key = f.dependsOn ? String(s[f.dependsOn]) : '';
  return (v as Record<string, T>)[key];
}

export function featureViews(s: Selection, base: Selection, focusAreas: string[]): FeatureView[] {
  const views = scheme.features.map((f) => {
    const detail = resolve(f.detail, f, s);
    const status = resolve(f.status, f, s);
    const wasDetail = resolve(f.detail, f, base);
    const wasStatus = resolve(f.status, f, base);
    const changed = detail !== wasDetail || status !== wasStatus;
    return { id: f.id, name: f.name, detail, status, relevant: !!f.focusArea && focusAreas.includes(f.focusArea), changed, wasDetail, wasStatus };
  });
  // Stable sort: things you told us matter first.
  return [...views.filter((v) => v.relevant), ...views.filter((v) => !v.relevant)];
}
