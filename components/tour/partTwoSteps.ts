/** Tours P and C (PART2.md §5). Scripted and deterministic; every action is safe to run twice. */
import { allowanceLeft, axaOutcome, claims, inPocketAfterTax, money, pay, signedMoney } from '@/lib/part2';
import { usePart2 } from '@/lib/part2Store';
import { usePlan } from '@/lib/store';
import type { TourStep } from './steps';

const p2 = () => usePart2.getState();
const rowTakeHome = (id: string) => pay.rows.find((r) => r.id === id)!.takeHome;
const ready = (h: Parameters<NonNullable<TourStep['enter']>>[0]) => h.waitFor(() => !p2().reading, 5000);

export const PAY_STEPS: TourStep[] = [
  {
    route: '/pay',
    target: '[data-tour="pay-summary"]',
    enter: () => p2().setMonth('april'),
    what: () => `Navigator compares April with March: take-home is up ${signedMoney(pay.takeHomeChange).slice(1)}, not the full ${money(pay.payRiseBeforeTax)} rise. The chart shows where the difference went.`,
    why: 'People see a smaller rise than they expected. Leading with the reason, in plain English, builds trust in the payslip.',
  },
  {
    route: '/pay',
    target: '[data-tour="pay-row-health"]',
    enter: () => p2().openRowOnly('health'),
    what: () => 'Health cover is now taxed through payroll: a new £116.67 line, higher because Sam joined, and the tax code is back to 1257L.',
    why: 'From April 2027 health benefits are taxed through payroll, so a new line appears on payslips. This explains it before anyone emails HR.',
  },
  {
    route: '/pay',
    target: '[data-tour="pay-row-cycle"]',
    enter: () => p2().openRowOnly('cycle'),
    what: () => `Salary sacrifice, with the maths shown: £83.33 comes off before tax, so take-home falls by only ${money(Math.abs(rowTakeHome('cycle')))}.`,
    why: 'Seeing the maths turns a confusing deduction into a benefit Priya understands.',
  },
  {
    route: '/pay',
    target: '[data-tour="pay-lines"]',
    what: () => 'Every line that changed, March against April, so the explanation ties back to the real payslip.',
    why: 'Nothing is hidden: the summary and the payslip agree to the penny.',
  },
  {
    route: '/pay',
    target: '[data-tour="pay-flag"]',
    enter: () => {
      if (p2().flag !== 'sent') {
        p2().setFlag('open');
        p2().setFlagLine('cycle');
        p2().sendFlag();
      }
    },
    what: () => 'Something look wrong? Priya picks the cycle to work line and sends it to payroll with the context attached.',
    why: 'Payroll gets a precise question with the payslip and the explanation, not a vague email.',
  },
];

const ensureGlasses = async (h: Parameters<NonNullable<TourStep['enter']>>[0]) => {
  if (p2().receipt !== 'glasses') await p2().pickReceipt('glasses');
  await ready(h);
};

export const CLAIM_STEPS: TourStep[] = [
  {
    route: '/claims',
    target: '[data-tour="claim-start"]',
    enter: () => p2().restartClaim(),
    what: () => 'Claim it starts with a receipt, not a form. Priya doesn’t have to pick a benefit.',
    why: 'Nobody needs to know which benefit covers what.',
  },
  {
    route: '/claims',
    target: '[data-tour="claim-fields"]',
    enter: async (h) => {
      if (p2().receipt !== 'glasses' || p2().submitted) await p2().pickReceipt('glasses');
      await ready(h);
    },
    what: () => 'Navigator scans the receipt, highlights the four details it read, and asks Priya to check them.',
    why: 'Navigator reads; Priya confirms every detail before anything is claimed.',
  },
  {
    route: '/claims',
    target: '[data-tour="claim-route"]',
    enter: ensureGlasses,
    what: () => {
      const g = claims.receipts.glasses;
      const after = allowanceLeft(claims.allowance.annual, [...claims.recent, { amount: g.amount }]);
      return `Glasses go to Meridian’s Wellbeing Allowance: ${money(after)} left after this, paid on ${claims.allowance.paidWithSalary}, ${money(inPocketAfterTax(g.amount))} in her pocket after tax.`;
    },
    why: 'The rules decide the route and the maths, and the tax is shown before she claims.',
  },
  {
    route: '/claims',
    target: '[data-tour="claim-status"]',
    enter: async (h) => {
      await ensureGlasses(h);
      if (!p2().submitted) { p2().setOwn(true); p2().submitClaim(); }
    },
    what: () => 'Priya confirms it’s hers and submits. It’s approved automatically and paid with her May salary.',
    why: 'Allowance claims never leave Navigator, and the payslip link closes the loop with Your pay.',
  },
  {
    route: '/claims',
    target: '[data-tour="claim-axa"]',
    enter: async (h) => {
      if (p2().receipt !== 'physio' || p2().submitted) await p2().pickReceipt('physio');
      await ready(h);
    },
    what: () => {
      const confirmed = usePlan.getState().confirmedSelection;
      const excess = confirmed ? confirmed.excess : 250;
      const out = axaOutcome(claims.receipts.physio.amount, excess);
      return out.axaPays === 0
        ? `Physio belongs to AXA. With a ${money(excess).replace('.00', '')} excess, AXA won’t pay this £65 invoice, but it still counts towards the excess.`
        : `Physio belongs to AXA, which should pay ${money(out.axaPays)} of this invoice.`;
    },
    why: 'Navigator explains the outcome before Priya spends time on a claim.',
  },
  {
    route: '/claims',
    target: '[data-tour="claim-handed"]',
    enter: async (h) => {
      if (p2().receipt !== 'physio') await p2().pickReceipt('physio');
      await ready(h);
      if (!p2().submitted) p2().handOff();
    },
    what: () => `Navigator hands the claim to AXA with every detail filled in, and checks back on ${claims.receipts.physio.axa!.checkIn}.`,
    why: 'Insurance claims stay with the insurer. Navigator removes the paperwork and the guesswork.',
  },
];
