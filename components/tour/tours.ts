/** The three guided tours, their reset and their end-card links (PART2.md §5). */
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';
import { CLAIM_STEPS, PAY_STEPS } from './partTwoSteps';
import { TOUR_STEPS, type TourStep } from './steps';

export type TourId = 'flex' | 'pay' | 'claims';

export interface Tour {
  steps: TourStep[];
  reset: () => void;
  end: { label: string; href: string }[];
  /** Where Finish takes the member, if anywhere. */
  finish?: string;
}

export const TOURS: Record<TourId, Tour> = {
  flex: {
    steps: TOUR_STEPS,
    reset: () => usePlan.getState().resetAll(),
    finish: '/benefits/pmi',
    end: [{ label: 'Read my notes', href: '/notes/flex' }, { label: 'Back to demo room', href: '/' }],
  },
  pay: {
    steps: PAY_STEPS,
    reset: () => usePart2.getState().resetPay(),
    end: [{ label: 'Read my notes', href: '/notes/pay' }, { label: 'Next: Claim it tour', href: '/claims?tour=1' }, { label: 'Back to demo room', href: '/' }],
  },
  claims: {
    steps: CLAIM_STEPS,
    reset: () => usePart2.getState().resetClaims(),
    end: [{ label: 'Read my notes', href: '/notes/claim' }, { label: 'Back to demo room', href: '/' }],
  },
};

/** Which tour ?tour=1 starts on a page. */
export const tourForPath = (p: string): TourId => (p.startsWith('/pay') ? 'pay' : p.startsWith('/claims') ? 'claims' : 'flex');
