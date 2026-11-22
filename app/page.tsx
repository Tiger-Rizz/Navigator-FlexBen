import Link from 'next/link';
import type { ReactNode } from 'react';
import { Play, ReceiptText, Sparkles, Wallet } from 'lucide-react';
import { getPersona, scenarioLibrary } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { formatMonthly } from '@/lib/engine/format';
import { countChanges } from '@/lib/plan';

export const metadata = { title: 'Divin’s demo room · Navigator prototype' };

const TAGS = ['Cover levels', 'Dependants', 'Employer options', 'Contribution trade-offs'];

function TourButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-ink px-[18px] py-3 text-sm font-medium text-white no-underline hover:bg-black">
      <Play aria-hidden size={12} fill="currentColor" />{children}
    </Link>
  );
}

function NotesLink({ href }: { href: string }) {
  return <Link href={href} className="inline-flex min-h-11 items-center px-1 text-sm underline underline-offset-2">Read my notes</Link>;
}

/** The reviewers' starting point (PART2.md §2, DemoRoom.dc.html). No Navigator sidebar. */
export default function DemoRoom() {
  const priya = getPersona('priya');
  const plan = (id: string) => scenarioLibrary.plans.find((p) => p.id === id)!.selection;
  const lean = price(plan('lean'), priya.peopleOnRecord, priya.taxRate);
  const samOnly = price({ ...priya.currentSelection, dependants: ['sam'] }, priya.peopleOnRecord, priya.taxRate);
  const changes = countChanges(priya.currentSelection, plan('lean'));
  const pct = (n: number) => `${(n / lean.premium) * 100}%`;

  return (
    <div className="min-h-screen bg-[#F7F8F6] px-4 pb-10 pt-12 sm:px-8 sm:pt-14">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="flex size-[30px] items-center justify-center rounded-[8px] bg-brand text-sm font-semibold text-white">M</span>
            <span className="text-[13px] text-secondary-2">Navigator prototype · Euphoric Deployment Strategist take-home</span>
          </div>
          <h1 className="text-[34px] tracking-[-0.02em]">Divin’s demo room</h1>
          <p className="max-w-[640px] text-base leading-relaxed text-ink-2">
            Two parts, each with a guided tour and my notes. Start with Part 1, the flex benefits prototype, then see two features I’d add to Navigator.
          </p>
        </header>

        <section aria-labelledby="part1" className="flex flex-col overflow-hidden rounded-[20px] border border-[#E6E8E4] bg-white lg:flex-row">
          <div className="flex flex-1 flex-col gap-3.5 px-6 py-8 sm:px-8">
            <span className="text-xs font-semibold tracking-[0.02em] text-brand">PART 1 · THE BRIEF</span>
            <h2 id="part1" className="text-2xl">Flex benefits for UK PMI</h2>
            <p className="max-w-[540px] text-[15px] leading-relaxed text-ink-2">
              Priya adds her spouse to her AXA health cover during enrolment. Navigator spots the gap, shows the real monthly cost including tax, lets an AI talk her through the trade-offs, and confirms it without leaving the app.
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {TAGS.map((t) => <li key={t} className="rounded-full bg-[#F1F2EF] px-2.5 py-1 text-xs text-ink-2">{t}</li>)}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <TourButton href="/home?tour=1">Take the guided tour · 3 min</TourButton>
              <Link href="/home" className="inline-flex min-h-11 items-center rounded-[10px] border border-line-control bg-white px-[18px] text-sm font-medium no-underline hover:bg-surface-2">Explore freely</Link>
              <NotesLink href="/notes/flex" />
            </div>
          </div>
          <div aria-hidden className="flex items-center justify-center bg-brand-tint px-6 py-8 lg:w-[45%]">
            <div className="flex w-full max-w-[420px] flex-col gap-3 rounded-[14px] border border-line bg-white p-[18px]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">Your cover from 1 April</span>
                <span className="rounded-[5px] bg-ai-bg px-1.5 py-0.5 text-[11px] font-medium text-ai-text">{changes} changes</span>
              </div>
              <span className="text-[30px] font-semibold tracking-tight">{formatMonthly(lean.realMonthlyCost)} <span className="text-xs font-normal text-secondary">a month</span></span>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded">
                <div className="bg-fund" style={{ width: pct(lean.employerPays) }} />
                <div className="bg-fund-soft" style={{ width: pct(lean.fromFund) }} />
                <div className="rounded-r bg-ink" style={{ width: pct(lean.fromPay) }} />
              </div>
              <p className="flex items-center gap-2 rounded-[10px] border border-ai-border bg-ai-soft px-3 py-2 text-xs">
                <Sparkles size={12} strokeWidth={1.8} className="shrink-0 text-ai-icon" />
                Add Sam, keep it lean: {formatMonthly(lean.realMonthlyCost)} instead of {formatMonthly(samOnly.realMonthlyCost)} a month.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="part2" className="flex flex-col gap-5 rounded-[20px] border border-[#E6E8E4] bg-white px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.02em] text-ai-text">PART 2 · BEYOND THE BRIEF</span>
            <h2 id="part2" className="text-2xl">Two features I’d add to Navigator</h2>
            <p className="max-w-[720px] text-[15px] leading-relaxed text-ink-2">
              Both are for employees and both follow Priya after enrolment: first her April payslip, then a claim in May. Each uses the same pattern as Part 1: the AI reasons, the rules and numbers come from code.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                icon: <Wallet aria-hidden size={18} strokeWidth={1.8} className="text-brand" />, tile: 'bg-brand-tint', title: 'Your pay, explained', tour: '/pay?tour=1', notes: '/notes/pay',
                body: 'When your payslip lands, Navigator tells you what changed and why, in plain English, line by line. Built for April 2027, when health benefits start being taxed through payroll.',
              },
              {
                icon: <ReceiptText aria-hidden size={18} strokeWidth={1.8} className="text-ai-icon" />, tile: 'bg-ai-bg', title: 'Claim it', tour: '/claims?tour=1', notes: '/notes/claim',
                body: 'Snap any receipt and Navigator works out which benefit pays. If Meridian’s allowance covers it, it’s claimed and paid in Navigator. If the insurer covers it, it’s prepared and handed to AXA with everything filled in.',
              },
            ].map((f) => (
              <article key={f.title} className="flex flex-col gap-3 rounded-[16px] border border-line px-[22px] py-5">
                <div className="flex items-center gap-2.5">
                  <span className={`flex size-9 items-center justify-center rounded-[10px] ${f.tile}`}>{f.icon}</span>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-ink-2">{f.body}</p>
                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
                  <TourButton href={f.tour}>Take the guided tour</TourButton>
                  <NotesLink href={f.notes} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-2 text-xs text-secondary-2">
          <span>Meridian Group, the scheme and all prices are fictional and illustrative. Guidance, not financial advice.</span>
          <span>Built by Divin Kamath</span>
        </footer>
      </div>
    </div>
  );
}
