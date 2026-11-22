/** Shared test fixtures: Priya and the three §8 plans. */
import { getPersona, scenarioLibrary, type Dependant, type Selection } from '@/lib/data';

export const priya = getPersona('priya');
export const child: Dependant = { id: 'kid1', name: 'Asha Shah', relationship: 'child', source: 'added_by_member', dob: '2022-05-01' };
export const people: Dependant[] = [...priya.peopleOnRecord, child];

const plan = (id: string): Selection => {
  const p = scenarioLibrary.plans.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p.selection;
};
export const current = priya.currentSelection;
export const addSamOnly: Selection = { ...current, dependants: ['sam'] };
export const lean = plan('lean');
export const enhanced = plan('enhanced');
export const keep = plan('keep');
export const currentPlusChild: Selection = { ...current, dependants: ['kid1'] };
