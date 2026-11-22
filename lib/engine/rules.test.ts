import { describe, expect, it } from 'vitest';
import { scenarioLibrary } from '@/lib/data';
import { ageOn, checkEligibility, chooseScenarios, daysLeft, isWindowOpen, parseDob, validateDob } from './rules';
import { priya } from './fixtures';

const sam = priya.peopleOnRecord;

describe('eligibility', () => {
  it('parents are not eligible, with the explanation', () => {
    const r = checkEligibility({ relationship: 'parent' });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('not_eligible_relationship');
    expect(r.explanation).toMatch(/parents and other relatives can’t be added/);
  });
  it('other relatives are not eligible', () => {
    expect(checkEligibility({ relationship: 'other_relative' }).eligible).toBe(false);
  });
  it('one partner only: another partner is refused when Sam is on record', () => {
    for (const relationship of ['spouse', 'civil_partner', 'cohabiting_partner'] as const) {
      const r = checkEligibility({ relationship, existing: sam });
      expect(r.eligible).toBe(false);
      expect(r.reason).toBe('partner_limit');
    }
    expect(checkEligibility({ relationship: 'spouse', existing: sam }).explanation).toContain('Sam is already listed above as your spouse');
  });
  it('a first partner, including a cohabiting partner, is eligible', () => {
    expect(checkEligibility({ relationship: 'cohabiting_partner', existing: [] }).eligible).toBe(true);
  });
  it('children are eligible under 21', () => {
    expect(checkEligibility({ relationship: 'child', age: 20 }).eligible).toBe(true);
    expect(checkEligibility({ relationship: 'child', age: 21 }).eligible).toBe(false);
  });
  it('children in full-time education are eligible under 25', () => {
    expect(checkEligibility({ relationship: 'child', age: 24, inFullTimeEducation: true }).eligible).toBe(true);
    const r = checkEligibility({ relationship: 'child', age: 25, inFullTimeEducation: true });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('child_too_old');
  });
});

describe('enrolment window', () => {
  it('is open on the demo day, 22 March 2027, with 9 days left', () => {
    expect(isWindowOpen('2027-03-22')).toBe(true);
    expect(daysLeft('2027-03-22')).toBe(9);
  });
  it('is closed from 1 April 2027 and before 1 March', () => {
    expect(isWindowOpen('2027-04-01')).toBe(false);
    expect(isWindowOpen('2027-02-28')).toBe(false);
  });
});

describe('dates of birth', () => {
  it('parses DD/MM/YYYY', () => expect(parseDob('14/07/1990')).toBe('1990-07-14'));
  it('rejects other formats and impossible dates', () => {
    expect(parseDob('1990-07-14')).toBeNull();
    expect(parseDob('31/02/1990')).toBeNull();
    expect(parseDob('')).toBeNull();
  });
  it('rejects a date in the future', () => expect(validateDob('01/01/2030')).toEqual({ ok: false, error: 'future' }));
  it('works out age on a date', () => {
    expect(ageOn('2006-04-02', '2027-04-01')).toBe(20);
    expect(ageOn('2006-04-01', '2027-04-01')).toBe(21);
  });
});

describe('scenario choice', () => {
  const all = scenarioLibrary.scenarios;
  it('picks scenarios from Priya’s focus areas', () => {
    expect(chooseScenarios(all, priya.focusAreas).map((s) => s.id)).toEqual(['knee', 'therapy', 'back-physio']);
  });
  it('adds Sam’s asthma once it has been mentioned in chat', () => {
    expect(chooseScenarios(all, priya.focusAreas, ['asthma'], ['sam']).map((s) => s.id)).toEqual(['knee', 'sam-asthma', 'therapy', 'back-physio']);
  });
});
