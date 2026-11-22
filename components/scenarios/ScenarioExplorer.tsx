'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sendMessage } from '@/lib/ai/client';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { scenarioModel } from '@/lib/scenarioView';
import { scenarioLibrary } from '@/lib/data';
import { firstName, sameSelection } from '@/lib/plan';
import { usePeople, usePersona, usePlan } from '@/lib/store';

export function ScenarioExplorer() {
  const router = useRouter();
  const persona = usePersona();
  const people = usePeople();
  const { selection, mentions, applySelection, proposal } = usePlan();
  const suggested = !!proposal && sameSelection(proposal.selection, scenarioLibrary.plans.find((p) => p.id === 'lean')!.selection);
  const m = scenarioModel(persona, people, selection, mentions, suggested);
  const leanIndex = m.columns.findIndex((c) => c.id === 'lean');
  const [picked, setSel] = useState<number | null>(null);
  const sel = picked ?? leanIndex;
  const four = m.columns.length > 3;
  const [whatIf, setWhatIf] = useState('');

  const cell = (i: number) => (i === sel ? 'bg-ai-soft' : '');
  const whoName = (who: string) => (who === 'member' ? persona.firstName : firstName(people.find((p) => p.id === who) ?? { name: who }));
  const chosen = m.columns[sel];
  const chosenLabel = chosen.id === 'keep' ? 'my current cover' : chosen.id === 'yours' ? 'my current choices' : chosen.name;

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Summary" data-tour="scenario-summary" className="flex gap-3 rounded-[16px] border border-ai-border bg-ai-soft px-6 py-5">
        <Sparkles aria-hidden size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-ai-icon" />
        <div className="flex flex-col gap-2 leading-relaxed">
          {m.headline.map((h) => <p key={h}>{h}</p>)}
        </div>
      </section>

      <section aria-labelledby="grid-h" data-tour="scenario-grid" tabIndex={0} className="overflow-x-auto rounded-[16px] border border-line">
        <h2 id="grid-h" className="sr-only">Scenarios compared across plans</h2>
        <table className={`w-full border-collapse text-left ${four ? 'min-w-[900px]' : 'min-w-[720px]'}`}>
          <caption className="px-5 pt-4 text-left text-xs text-secondary-2">Choose a plan to highlight it</caption>
          <thead>
            <tr>
              <th scope="col" className={`${four ? 'w-[26%]' : 'w-[34%]'} px-5 py-3 align-bottom text-[13px] font-medium text-secondary`}>Situation</th>
              {m.columns.map((c, i) => (
                <th key={c.id} scope="col" className={`px-3 py-3 align-top ${cell(i)}`}>
                  <button
                    type="button"
                    aria-pressed={i === sel}
                    onClick={() => setSel(i)}
                    className={`flex min-h-11 w-full flex-col gap-1 rounded-[12px] border p-3 text-left cursor-pointer ${i === sel ? 'border-ai-highlight bg-white' : 'border-line bg-white hover:bg-surface-2'}`}
                  >
                    <span className={`text-xs font-medium ${c.ai ? 'text-ai-text' : 'text-secondary'}`}>{c.tag}</span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-xs font-normal text-secondary">{c.sub}</span>
                    <span className="mt-1 font-semibold">{formatMonthly(m.rows[i].realMonthlyCost)} <span className="text-xs font-normal text-secondary">a month</span></span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.scenarios.map((s, r) => (
              <tr key={s.id} className="border-t border-divider">
                <th scope="row" className="px-5 py-4 align-top font-normal">
                  <span className="block text-xs text-secondary-2">{whoName(s.who)} · typical cost {s.typicalCostLabel}</span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="mt-1 block text-xs text-secondary">{s.journey.join(' → ')}</span>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-ai-bg px-2 py-0.5 text-xs font-medium text-ai-text">
                    <Sparkles aria-hidden size={11} strokeWidth={1.8} />{s.why}
                  </span>
                </th>
                {m.rows.map((row, i) => {
                  const res = row.results[r];
                  return (
                    <td key={row.planId} className={`px-4 py-4 align-top ${cell(i)}`}>
                      <span className={`block text-lg font-semibold ${res.memberPays === 0 ? 'text-success' : ''}`}>{formatAnnual(res.memberPays)}</span>
                      <span className="block text-xs text-secondary">{res.note}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {[
              { label: 'If nothing happens this year', sub: 'What the cover costs you: deductions plus tax', get: (i: number) => m.rows[i].totals.coverCost },
              { label: `If ${m.countWord} happened in one year`, sub: 'Cover cost plus claims, with the excess paid once per person', get: (i: number) => m.rows[i].totals.allInOneYear },
            ].map((t) => (
              <tr key={t.label} className="border-t-2 border-line">
                <th scope="row" className="px-5 py-4 align-top">
                  <span className="block font-semibold">{t.label}</span>
                  <span className="block text-xs font-normal text-secondary">{t.sub}</span>
                </th>
                {m.rows.map((row, i) => (
                  <td key={row.planId} className={`px-4 py-4 align-top text-lg font-semibold ${cell(i)}`}>{formatAnnual(t.get(i))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <form
          className="flex flex-1 flex-col gap-1.5"
          onSubmit={(e) => { e.preventDefault(); if (!whatIf.trim()) return; void sendMessage(whatIf); router.push('/benefits/pmi/chat'); }}
        >
          <label htmlFor="what-if" className="text-[13px] font-medium">Ask your own what-if</label>
          <div className="flex gap-2">
            <input id="what-if" value={whatIf} onChange={(e) => setWhatIf(e.target.value)} placeholder="Ask your own, like “what if Sam needed a hernia operation?”" className="min-h-11 flex-1 rounded-[10px] border border-line-control px-3" />
            <Button type="submit" variant="secondary">Add scenario</Button>
          </div>
        </form>
        <Button onClick={() => { applySelection(chosen.selection); router.push('/benefits/pmi/review'); }} data-tour="continue-plan">
          Continue with {chosenLabel} <ArrowRight aria-hidden size={16} />
        </Button>
      </div>
      <p className="text-xs text-secondary-2">
        Illustrative costs, worked out from your plan’s rules: the excess is paid once per person each year and counts towards the outpatient allowance; MRI, CT and PET scans are paid in full at AXA scanning centres. Not a prediction of what will happen, and not financial advice.
      </p>
    </div>
  );
}
