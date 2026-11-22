/** Personalised one-line answers for the five common questions. Numbers come from the engines. */
import { scenarioLibrary, type Dependant, type Persona, type Selection } from '@/lib/data';
import { memberPays } from '@/lib/engine/claims';
import { monthlyDifference } from '@/lib/engine/pricing';
import { formatAnnual, formatMonthly } from '@/lib/engine/format';
import { firstName } from '@/lib/plan';
import { COMMON_QUESTIONS } from './questions';

export function kneeScenario() {
  return scenarioLibrary.scenarios.find((s) => s.id === 'knee')!;
}

export function shortAnswers(persona: Persona, selection: Selection, people: Dependant[]): { q: string; short: string }[] {
  const gap = persona.peopleOnRecord.find((p) => !selection.dependants.includes(p.id));
  const partner = persona.peopleOnRecord[0];
  const addCost = gap ? monthlyDifference(selection, { ...selection, dependants: [...selection.dependants, gap.id] }, people, persona.taxRate) : 0;
  const knee = memberPays(kneeScenario(), selection, people).memberPays;
  return [
    {
      q: COMMON_QUESTIONS[0],
      short: gap
        ? `Yes, until 31 March. About ${formatMonthly(addCost)} more a month.`
        : `Yes, ${partner ? firstName(partner) : 'they'}’s in your choices.`,
    },
    { q: COMMON_QUESTIONS[1], short: `On your current choices: ${formatAnnual(knee)}.` },
    { q: COMMON_QUESTIONS[2], short: 'Higher mental health limit, and a new lower-cost option.' },
    { q: COMMON_QUESTIONS[3], short: 'Only after another life event, until March 2028.' },
    { q: COMMON_QUESTIONS[4], short: 'Yes, for you and anyone you add now.' },
  ];
}
