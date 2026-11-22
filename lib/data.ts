import { z } from 'zod';
import employerJson from '@/data/employer.meridian.json';
import schemeJson from '@/data/scheme.axa-pmi.json';
import planYearsJson from '@/data/plan-years.json';
import scenariosJson from '@/data/scenarios.json';
import priyaJson from '@/data/personas/priya.json';
import tomJson from '@/data/personas/tom.json';
import notesJson from '@/data/notes.json';

// ---- Primitive enums (CLAUDE.md §6) ----
export const TierSchema = z.enum(['core', 'enhanced', 'premium']);
export const ExcessSchema = z.union([z.literal(0), z.literal(100), z.literal(250), z.literal(500)]);
export const OutpatientSchema = z.union([z.literal(500), z.literal(1000), z.literal('full')]);
export const SpecialistSchema = z.enum(['guided', 'directory', 'extended']);
export const RelationshipSchema = z.enum(['spouse', 'civil_partner', 'cohabiting_partner', 'child']);
export const FeatureStatusSchema = z.enum(['Included', 'Limited', 'Not on your plan']);

export type Tier = z.infer<typeof TierSchema>;
export type Excess = z.infer<typeof ExcessSchema>;
export type Outpatient = z.infer<typeof OutpatientSchema>;
export type Specialist = z.infer<typeof SpecialistSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;

// ---- Core shapes ----
export const DependantSchema = z.object({
  id: z.string(),
  name: z.string(),
  relationship: RelationshipSchema,
  source: z.enum(['hr_record', 'added_by_member']),
  dob: z.string().optional(),
});
export type Dependant = z.infer<typeof DependantSchema>;

export const SelectionSchema = z.object({
  tier: TierSchema,
  excess: ExcessSchema,
  outpatient: OutpatientSchema,
  specialist: SpecialistSchema,
  dependants: z.array(z.string()),
});
export type Selection = z.infer<typeof SelectionSchema>;

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  firstName: z.string(),
  initials: z.string(),
  age: z.number().int(),
  postcode: z.string(),
  area: z.string(),
  taxRate: z.union([z.literal(0.2), z.literal(0.4), z.literal(0.45)]),
  band: z.string(),
  focusAreas: z.array(z.string()),
  peopleOnRecord: z.array(DependantSchema),
  currentSelection: SelectionSchema,
});
export type Persona = z.infer<typeof PersonaSchema>;

// ---- Employer ----
export const EmployerSchema = z.object({
  id: z.string(),
  name: z.string(),
  appName: z.string(),
  branding: z.object({
    tile: z.string(), tint: z.string(), tintBorder: z.string(), fundBar: z.string(), fundBarSoft: z.string(),
  }),
  flexFund: z.number(),
  employerContribution: z.object({ description: z.string(), annualCap: z.number(), basis: SelectionSchema }),
  enrolmentWindow: z.object({ opens: z.string(), closes: z.string() }),
  coverYear: z.object({ starts: z.string(), ends: z.string(), label: z.string() }),
  demoToday: z.string(),
  payrollNote: z.string(),
  payrollStarts: z.string(),
});
export type Employer = z.infer<typeof EmployerSchema>;

// ---- Scheme ----
const option = <T extends z.ZodTypeAny>(value: T) =>
  z.object({ value, label: z.string(), summary: z.string(), factor: z.number().positive(), hint: z.string() });

const perTier = <T extends z.ZodTypeAny>(v: T) => z.object({ core: v, enhanced: v, premium: v });

export const FeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  focusArea: z.string().nullable(),
  dependsOn: z.enum(['tier', 'outpatient', 'specialist']).nullable(),
  detail: z.union([z.string(), z.record(z.string(), z.string())]),
  status: z.union([FeatureStatusSchema, z.record(z.string(), FeatureStatusSchema)]),
});
export type Feature = z.infer<typeof FeatureSchema>;

export const PolicyTextSchema = z.object({ id: z.string(), title: z.string(), text: z.string() });
export type PolicyText = z.infer<typeof PolicyTextSchema>;

export const SchemeSchema = z.object({
  id: z.string(),
  insurer: z.string(),
  name: z.string(),
  options: z.object({
    tier: z.array(option(TierSchema)),
    excess: z.array(option(ExcessSchema)),
    outpatient: z.array(option(OutpatientSchema)),
    specialist: z.array(option(SpecialistSchema)),
  }),
  rates: z.object({ adult: perTier(z.number().positive()), childFactor: z.number().positive() }),
  limits: z.object({
    physioSessions: perTier(z.number().int().nullable()),
    physioSessionCost: z.number(),
    mentalHealthOutpatient: perTier(z.number().nullable()),
  }),
  features: z.array(FeatureSchema),
  rules: z.object({
    eligibleRelationships: z.array(RelationshipSchema),
    partnerRelationships: z.array(RelationshipSchema),
    maxPartners: z.number().int(),
    childMaxAge: z.number().int(),
    childMaxAgeInEducation: z.number().int(),
    medicalHistoryDisregarded: z.string(),
    afterWindow: z.string(),
    lifeEventDays: z.number().int(),
    rejoining: z.string(),
    excess: z.string(),
    paidInFull: z.string(),
    copy: z.object({
      partner: z.string(), partnerAlreadyListed: z.string(), child: z.string(), childTooOld: z.string(), notEligible: z.string(),
    }),
  }),
  policyText: z.array(PolicyTextSchema),
});
export type Scheme = z.infer<typeof SchemeSchema>;

// ---- Plan years ----
export const PlanYearsSchema = z.object({
  from: z.string(),
  to: z.string(),
  source: z.string(),
  differences: z.array(z.object({
    id: z.string(), label: z.string(), from: z.string(), to: z.string(), note: z.string(), improved: z.boolean(),
  })),
});
export type PlanYears = z.infer<typeof PlanYearsSchema>;

// ---- Scenarios ----
export const ScenarioSchema = z.object({
  id: z.string(),
  who: z.string(), // 'member' or a dependant id
  title: z.string(),
  focusArea: z.string().nullable(),
  mentionKey: z.string().optional(),
  why: z.string(),
  typicalCostLabel: z.string(),
  journey: z.array(z.string()),
  costs: z.object({
    outpatient: z.number().nonnegative().optional(),
    mentalHealth: z.number().nonnegative().optional(),
    physioSessions: z.number().int().nonnegative().optional(),
    paidInFull: z.number().nonnegative().optional(),
  }),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ScenarioLibrarySchema = z.object({
  plans: z.array(z.object({ id: z.string(), tag: z.string(), name: z.string(), sub: z.string(), selection: SelectionSchema })),
  scenarios: z.array(ScenarioSchema),
});
export type ScenarioLibrary = z.infer<typeof ScenarioLibrarySchema>;

// ---- Notes for reviewers (PART2.md §6): copied word for word from Notes.dc.html ----
export const NoteSchema = z.object({
  id: z.enum(['flex', 'pay', 'claim']),
  kicker: z.string(),
  color: z.string(),
  label: z.string(),
  title: z.string(),
  thesis: z.string(),
  tourHref: z.string(),
  sections: z.array(z.object({ heading: z.string(), items: z.array(z.string()).min(1) })).min(1),
});
export type Note = z.infer<typeof NoteSchema>;

// ---- Validated loaders (throw at import time if the JSON is wrong) ----
export const employer: Employer = EmployerSchema.parse(employerJson);
export const scheme: Scheme = SchemeSchema.parse(schemeJson);
export const planYears: PlanYears = PlanYearsSchema.parse(planYearsJson);
export const scenarioLibrary: ScenarioLibrary = ScenarioLibrarySchema.parse(scenariosJson);
export const notes: Note[] = z.object({ notes: z.array(NoteSchema).length(3) }).parse(notesJson).notes;
export const personas: Record<string, Persona> = {
  priya: PersonaSchema.parse(priyaJson),
  tom: PersonaSchema.parse(tomJson),
};

export function getPersona(id: string): Persona {
  const p = personas[id];
  if (!p) throw new Error(`Unknown persona: ${id}`);
  return p;
}
