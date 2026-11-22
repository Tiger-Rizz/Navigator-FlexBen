/** Scheme rules: eligibility, enrolment window, dates of birth, scenario choice. Pure functions. */
import { employer, scheme, type Dependant, type Relationship, type Scenario } from '@/lib/data';

export type EligibilityRelationship = Relationship | 'parent' | 'other_relative';

export interface EligibilityQuery {
  relationship: EligibilityRelationship;
  age?: number;
  inFullTimeEducation?: boolean;
  /** People already covered or on record; used for the one-partner rule. */
  existing?: Dependant[];
}

export interface EligibilityResult {
  eligible: boolean;
  reason: 'ok' | 'not_eligible_relationship' | 'partner_limit' | 'child_too_old';
  explanation: string;
}

const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  spouse: 'spouse',
  civil_partner: 'civil partner',
  cohabiting_partner: 'partner',
  child: 'child',
};
export const relationshipLabel = (r: Relationship) => RELATIONSHIP_LABEL[r];

export function isPartner(r: string): boolean {
  return (scheme.rules.partnerRelationships as string[]).includes(r);
}

export function checkEligibility(q: EligibilityQuery): EligibilityResult {
  const { rules } = scheme;
  if (!(rules.eligibleRelationships as string[]).includes(q.relationship)) {
    return { eligible: false, reason: 'not_eligible_relationship', explanation: rules.copy.notEligible };
  }
  if (isPartner(q.relationship)) {
    const partners = (q.existing ?? []).filter((d) => isPartner(d.relationship));
    if (partners.length >= rules.maxPartners) {
      const partner = partners[0];
      const first = partner.name.split(' ')[0];
      return {
        eligible: false,
        reason: 'partner_limit',
        explanation: rules.copy.partnerAlreadyListed.replace('{name}', first).replace('{relationship}', RELATIONSHIP_LABEL[partner.relationship]),
      };
    }
    return { eligible: true, reason: 'ok', explanation: rules.copy.partner };
  }
  // Child
  if (q.age !== undefined) {
    const limit = q.inFullTimeEducation ? rules.childMaxAgeInEducation : rules.childMaxAge;
    if (q.age >= limit) return { eligible: false, reason: 'child_too_old', explanation: rules.copy.childTooOld };
  }
  return { eligible: true, reason: 'ok', explanation: rules.copy.child };
}

// ---- Dates ----
const DAY_MS = 24 * 60 * 60 * 1000;
const toUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export function isWindowOpen(todayIso: string = employer.demoToday): boolean {
  const t = toUtc(todayIso);
  return t >= toUtc(employer.enrolmentWindow.opens) && t <= toUtc(employer.enrolmentWindow.closes);
}

/** Days left until the window closes: 22 March → 31 March = 9. */
export function daysLeft(todayIso: string = employer.demoToday): number {
  return Math.max(0, Math.round((toUtc(employer.enrolmentWindow.closes) - toUtc(todayIso)) / DAY_MS));
}

/** Parses DD/MM/YYYY into an ISO date, or null if it isn't a real date. */
export function parseDob(input: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function ageOn(dobIso: string, onIso: string): number {
  const [by, bm, bd] = dobIso.split('-').map(Number);
  const [y, m, d] = onIso.split('-').map(Number);
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age -= 1;
  return age;
}

export type DobCheck = { ok: true; iso: string } | { ok: false; error: 'format' | 'future' };

/** Validates a DD/MM/YYYY date of birth against the demo "today". */
export function validateDob(input: string, todayIso: string = employer.demoToday): DobCheck {
  const iso = parseDob(input);
  if (!iso) return { ok: false, error: 'format' };
  if (toUtc(iso) > toUtc(todayIso)) return { ok: false, error: 'future' };
  return { ok: true, iso };
}

// ---- Scenario choice: focus areas plus anything mentioned in chat (§8) ----
export function chooseScenarios(
  all: Scenario[],
  focusAreas: string[],
  mentions: string[] = [],
  coverablePeople: string[] = [],
): Scenario[] {
  return all.filter((s) => {
    if (s.mentionKey) return mentions.includes(s.mentionKey) && (s.who === 'member' || coverablePeople.includes(s.who));
    return s.focusArea !== null && focusAreas.includes(s.focusArea);
  });
}
