/** Message and proposal shapes shared by the chat UI, the API route and the scripted fallback. */
import { z } from 'zod';
import { SelectionSchema, ExcessSchema, OutpatientSchema, SpecialistSchema, TierSchema } from '@/lib/data';

export const ChangeSchema = z.discriminatedUnion('field', [
  z.object({ field: z.literal('tier'), value: TierSchema }),
  z.object({ field: z.literal('excess'), value: ExcessSchema }),
  z.object({ field: z.literal('outpatient'), value: OutpatientSchema }),
  z.object({ field: z.literal('specialist'), value: SpecialistSchema }),
  z.object({ field: z.literal('add_dependant'), value: z.string().describe('Dependant id, e.g. "sam"') }),
  z.object({ field: z.literal('remove_dependant'), value: z.string() }),
]);
export type Change = z.infer<typeof ChangeSchema>;

export interface ProposalLine {
  icon: '+' | '−' | '↗' | '↘' | '→';
  text: string;
}

export interface Proposal {
  id: string;
  title: string;
  rationale: string;
  lines: ProposalLine[];
  from: z.infer<typeof SelectionSchema>;
  selection: z.infer<typeof SelectionSchema>;
  monthly: number;
  alternative: { label: string; monthly: number; selection: z.infer<typeof SelectionSchema> } | null;
  taxNote: string | null;
}

export interface ScenarioCardData {
  label: string;      // "You’d pay"
  amount: number;     // annual pounds
  note: string;
}

/** Parts the UI knows how to render. Both the live model and the scripted fallback produce these. */
export type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'proposal'; proposal: Proposal }
  | { type: 'scenario'; card: ScenarioCardData }
  | { type: 'links'; items: string[] }
  | { type: 'privacy' }
  | { type: 'sources'; items: string[] }
  | { type: 'actions'; items: { label: string; href?: string; action?: 'add_sam' } [] }
  | { type: 'chips'; items: string[] };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

/** Stream events sent from /api/chat (NDJSON) and from the local scripted runner. */
export type StreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'part'; part: Exclude<MessagePart, { type: 'text' }> }
  | { type: 'mode'; mode: 'live' | 'scripted' }
  | { type: 'done' };

/** Plan context the client sends with every request, so the AI reasons about the plan on screen. */
export const PlanContextSchema = z.object({
  personaId: z.string(),
  selection: SelectionSchema,
  addedPeople: z.array(z.object({
    id: z.string(), name: z.string(), relationship: z.enum(['spouse', 'civil_partner', 'cohabiting_partner', 'child']),
    source: z.enum(['hr_record', 'added_by_member']), dob: z.string().optional(),
  })),
  mentions: z.array(z.string()),
});
export type PlanContext = z.infer<typeof PlanContextSchema>;
