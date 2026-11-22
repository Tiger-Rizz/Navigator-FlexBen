/** Scenario explorer model (CLAUDE.md §8, §9): plan columns, scenario rows and the headline. Pure. */
import { scenarioLibrary, type Dependant, type Persona, type Selection } from '@/lib/data';
import { comparePlans, displayedDifference, type PlanComparison } from '@/lib/engine/claims';
import { formatAnnual } from '@/lib/engine/format';
import { chooseScenarios } from '@/lib/engine/rules';
import { firstName, leverSummary, sameSelection, whoLabel, lowerFirst } from '@/lib/plan';

export interface PlanColumn {
  id: string;
  tag: string;
  name: string;
  sub: string;
  selection: Selection;
  ai: boolean;
}

const plan = (id: string) => scenarioLibrary.plans.find((p) => p.id === id)!;
const COUNT = ['none', 'it', 'both', 'all three', 'all four', 'all five'];

export function scenarioColumns(selection: Selection, people: Dependant[]): PlanColumn[] {
  const keep = plan('keep');
  const lean = plan('lean');
  const enhanced = plan('enhanced');
  const isLibraryPlan = [keep, lean, enhanced].some((p) => sameSelection(p.selection, selection));
  const middle: PlanColumn = isLibraryPlan
    ? { ...lean, ai: true }
    : {
        id: 'yours', tag: 'Your plan', name: 'Your current choices', ai: true, selection,
        sub: `${leverSummary(selection).replace(/^./, (c) => c.toUpperCase())}, ${lowerFirst(whoLabel(selection, people))}`,
      };
  return [{ ...keep, ai: false }, middle, { ...enhanced, ai: false }];
}

export interface ScenarioModel {
  columns: PlanColumn[];
  scenarios: ReturnType<typeof chooseScenarios>;
  rows: PlanComparison[];
  headline: string[];
  countWord: string;
}

export function scenarioModel(persona: Persona, people: Dependant[], selection: Selection, mentions: string[]): ScenarioModel {
  const columns = scenarioColumns(selection, people);
  const scenarios = chooseScenarios(scenarioLibrary.scenarios, persona.focusAreas, mentions, people.map((p) => p.id));
  const rows = comparePlans(columns.map((c) => ({ id: c.id, selection: c.selection })), scenarios, people, persona.taxRate);
  const [keep, mid, enh] = rows;
  const countWord = COUNT[scenarios.length] ?? `all ${scenarios.length}`;

  const yearMore = displayedDifference(keep.totals.coverCost, mid.totals.coverCost);
  const enhMore = displayedDifference(mid.totals.allInOneYear, enh.totals.allInOneYear);
  const partner = persona.peopleOnRecord.find((p) => p.relationship !== 'child');
  const midName = columns[1].id === 'lean' && partner ? `Adding ${firstName(partner)} the lean way` : 'Your current choices';
  const tradeOff = mid.selection.excess > 0 ? `, and its main trade-off is the ${formatAnnual(mid.selection.excess)} excess` : '';

  const headline = [
    `${midName} ${yearMore >= 0 ? `costs you ${formatAnnual(yearMore)} a year more` : `saves you ${formatAnnual(-yearMore)} a year`} than today${tradeOff}. ` +
      (enhMore > 0
        ? `Even if ${countWord} of these happened in one year, Enhanced would still cost you ${formatAnnual(enhMore)} more overall. It’s only worth it if you’d value outpatient care paid in full and a free choice of specialist.`
        : `If ${countWord} of these happened in one year, Enhanced would cost you ${formatAnnual(-enhMore)} less overall, because it pays outpatient care in full.`),
  ];
  if (partner && !keep.selection.dependants.includes(partner.id)) {
    headline.push(`The biggest risk is in today’s plan: ${firstName(partner)} isn’t covered, so anything serious for him means the NHS waiting list or paying privately in full.`);
  }
  return { columns, scenarios, rows, headline, countWord };
}
