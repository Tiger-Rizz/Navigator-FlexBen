/** The three guided tours, their reset and their end-card links (PART2.md §5). */
import { notes } from '@/lib/data';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';
import { CLAIM_STEPS, PAY_STEPS } from './partTwoSteps';
import { TOUR_STEPS, type TourStep } from './steps';

export type TourId = 'flex' | 'pay' | 'claims';

export interface TourIntroContent {
  date: string;
  title: string;
  scenario: string;
  people: { initials: string; name: string; detail: string; muted?: boolean }[];
  assumptions: string[];
  notesHref: string;
}

/** Part 1 assumptions come straight from the notes, so the intro and /notes/flex always agree. */
const flexAssumptions = notes.find((n) => n.id === 'flex')!.sections.find((s) => s.heading === 'Assumptions')!.items;

export interface Tour {
  intro?: TourIntroContent;
  steps: TourStep[];
  reset: () => void;
  end: { label: string; href: string }[];
  /** Where Finish takes the member, if anywhere. */
  finish?: string;
}

export const TOURS: Record<TourId, Tour> = {
  flex: {
    intro: {
      date: 'Monday 22 March 2027',
      title: 'The scenario',
      scenario: 'Meridian Group, a fictional UK employer, offers AXA private medical insurance as a flex benefit. Annual enrolment closes on 31 March, in 9 days, and Priya is choosing her cover for April 2027 to March 2028.',
      people: [
        { initials: 'PS', name: 'Priya Shah', detail: 'Meridian employee, 34, London · covered on her own' },
        { initials: 'SS', name: 'Sam Shah', detail: 'Her spouse, on her HR record · not on her cover', muted: true },
      ],
      assumptions: flexAssumptions,
      notesHref: '/notes/flex',
    },
    steps: TOUR_STEPS,
    reset: () => usePlan.getState().resetAll(),
    finish: '/benefits/pmi',
    end: [{ label: 'Read my notes', href: '/notes/flex' }, { label: 'Back to demo room', href: '/' }],
  },
  pay: {
    intro: {
      date: 'Friday 30 April 2027',
      title: 'Five weeks later',
      scenario: 'Priya’s first payslip since enrolment has landed. Her salary went up 3%, she started cycle to work, and Sam is now on her health cover, which is taxed through payroll from April 2027.',
      people: [],
      assumptions: [],
      notesHref: '/notes/pay',
    },
    steps: PAY_STEPS,
    reset: () => usePart2.getState().resetPay(),
    end: [{ label: 'Read my notes', href: '/notes/pay' }, { label: 'Next: Claim it tour', href: '/claims?tour=1' }, { label: 'Back to demo room', href: '/' }],
  },
  claims: {
    intro: {
      date: 'Friday 14 May 2027',
      title: 'A claim in May',
      scenario: 'Priya has two receipts: new glasses and a physio assessment. She doesn’t know which benefit pays for which, and she doesn’t need to: Meridian’s £500 Wellbeing Allowance and her AXA cover both sit in Navigator.',
      people: [],
      assumptions: [],
      notesHref: '/notes/claim',
    },
    steps: CLAIM_STEPS,
    reset: () => usePart2.getState().resetClaims(),
    end: [{ label: 'Read my notes', href: '/notes/claim' }, { label: 'Back to demo room', href: '/' }],
  },
};

/** Which tour ?tour=1 starts on a page. */
export const tourForPath = (p: string): TourId => (p.startsWith('/pay') ? 'pay' : p.startsWith('/claims') ? 'claims' : 'flex');
