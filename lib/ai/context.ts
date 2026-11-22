/** Resolves the plan context sent by the client into persona, people and selection. */
import { getPersona, type Dependant, type Persona, type Selection } from '@/lib/data';
import type { PlanContext } from './types';

export interface ResolvedContext {
  persona: Persona;
  people: Dependant[];
  selection: Selection;
  mentions: string[];
}

export function resolveContext(ctx: PlanContext): ResolvedContext {
  const persona = getPersona(ctx.personaId);
  const people = [...persona.peopleOnRecord, ...ctx.addedPeople.filter((p) => p.source === 'added_by_member')];
  // Never trust ids the client sends: keep only people we know about.
  const selection = { ...ctx.selection, dependants: ctx.selection.dependants.filter((d) => people.some((p) => p.id === d)) };
  return { persona, people, selection, mentions: ctx.mentions };
}
