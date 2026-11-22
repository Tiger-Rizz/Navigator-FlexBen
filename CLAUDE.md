# CLAUDE.md - Navigator Flex PMI prototype

Read this file fully before writing any code. It is the source of truth for this project.
When this file and the design reference disagree, this file wins. When something isn't covered, choose the simplest option that matches the design reference and note the decision in `DECISIONS.md`.

---

## 1. What we're building and why

A take-home prototype for Euphoric's **Deployment Strategist** role. The brief: design and prototype an **AI-native flexible benefits experience inside Navigator** (Euphoric's employee-facing benefits app) for a **UK Private Medical Insurance (PMI)** benefit, covering cover levels, dependants, employer-defined options and contribution trade-offs.

**How it will be judged:** the reviewers (Euphoric's AI Product Lead and CPO) will open a link and click through **on their own, without anyone presenting**. So:

1. It must look and feel like the real Navigator: consumer-grade, calm, minimal. **We mirror their UI. The innovation is in the UX and the AI, not the visuals.**
2. It must have a **guided demo mode** that walks a reviewer through the story with short captions, and a **free-explore mode**.
3. It must **never break**. The AI has a scripted fallback, so the demo works even if the API fails or no key is set.
4. Every number must be right. Prices and tax come from a deterministic engine with unit tests, never from the LLM.

### The one-line thesis (use it in copy and the reviewer notes)

> Flex isn't a form problem, it's a decision problem. Navigator already helps people *understand* their benefits; this lets them *act*, by turning insurance trade-offs into consequences they can see, with an AI that reasons and code that calculates.

---

## 2. Product principles (non-negotiable)

1. **AI-native, not AI-bolted-on.** Chat and screen are two views of the same plan state. The AI proposes changes *to the plan*, shown as highlighted differences the user accepts or rejects.
2. **The AI reasons; code calculates.** The LLM never produces a price, tax figure or option. It calls tools that use the pricing engine and the scheme configuration.
3. **Only real options.** Options, prices and eligibility come from the employer's scheme config (in reality from GAP). The AI may only combine options that exist.
4. **Guidance, not advice.** Explain trade-offs and consequences; never say "you should buy X". The footer reads "Guidance, not financial advice."
5. **Show the real cost.** Always the real monthly cost: payroll deduction **plus** income tax on the benefit, after Meridian's contribution and the Flex Fund.
6. **Warn before anything hard to undo.** Before confirming, surface what can't easily be reversed (rejoining rules, the excess, Guided specialist choice, Flex Fund given up).
7. **Privacy by design.** Health information a user mentions (e.g. Sam's asthma) stays between the user and Navigator. Show: "This stays between you and Navigator. Meridian never sees it." Never infer life events. Navigator spots **gaps between people on record and the cover they have**, and asks.
8. **Easiest path first.** Most people keep their cover or add family. The quick choices come first; "Fine-tune your cover" is collapsed by default.
9. **Accessible and honest.** Real buttons and links, labels on inputs, visible focus, 4.5:1 contrast, touch targets ≥ 44px. No dark patterns: "Keep my cover" and other choices carry equal visual weight.

---

## 3. Fictional setup (never use real client names)

- **Employer:** Meridian Group, a UK-headquartered multinational. White-labelled app name: **"Meridian Benefits"**.
- **Insurer:** AXA Health (the brief explicitly names AXA). Use a simple text wordmark tile ("AXA" on #00008F); never copy AXA's real logo.
- **Do not reference Disney** or any real Euphoric client anywhere, including code comments and commit messages. The reference videos are confidential.
- **Demo "today":** Monday 22 March 2027. **Enrolment window:** 1–31 March 2027 (9 days left). **Cover year:** 1 April 2027 – 31 March 2028.
- **Context to reference:** from 6 April 2027 UK employer-provided medical benefits are **payrolled** (tax collected through payroll each month rather than via P11D and the tax code). The review screen shows an April 2027 payslip preview.

---

## 4. Stack

- **Next.js** (latest stable, App Router, TypeScript, `src/` not required), deployed on **Vercel**.
- **Tailwind CSS** for styling, with design tokens from §10 in `tailwind.config` / CSS variables.
- **Radix UI primitives** only where needed (dialog, collapsible, tooltip). No heavy component kit restyling.
- **lucide-react** for icons (outline style, 1.8 stroke). The AI sparkle uses `Sparkles`.
- **Framer Motion** for subtle transitions only (panel open, highlighted differences, tour spotlight). Respect `prefers-reduced-motion`.
- **Zustand** (with `persist` to `sessionStorage`) for shared plan state across pages.
- **Vercel AI SDK** (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) with **tool calling** and streaming. Model from env `ANTHROPIC_MODEL`, default `claude-sonnet-5-5`.
- **zod** for tool schemas and data validation.
- **Vitest** for engine unit tests.
- No database. All data is JSON in `/data`.

---

## 5. Folder structure

```
/app
  layout.tsx                    # Shell: sidebar + main, fonts, providers, tour root
  page.tsx                      # Home
  benefits/page.tsx             # Simple benefits grid (PMI card + 3 static cards)
  benefits/pmi/page.tsx         # A · Evolved PMI page (the centrepiece)
  benefits/pmi/chat/page.tsx    # B · AI plan builder (chat + live plan)
  benefits/pmi/scenarios/page.tsx  # C · Scenario explorer
  benefits/pmi/review/page.tsx  # Review and confirm (+ confirmed state)
  my-choices/page.tsx           # Confirmed elections
  about/page.tsx                # "Notes for reviewers"
  api/chat/route.ts             # AI endpoint (tools, streaming, fallback)
/components
  shell/ Sidebar.tsx, PointsPill.tsx, SearchOrAsk.tsx
  pmi/ BenefitHeader.tsx, NudgeCard.tsx, QuickChoices.tsx, WhosCovered.tsx,
       FineTune.tsx, WhatsChanged.tsx, FeatureGrid.tsx, CommonQuestions.tsx,
       CoverPanel.tsx
  ai/ AskPanel.tsx (floating), ChatThread.tsx, ProposalCard.tsx, ScenarioCard.tsx,
      MemberContextCard.tsx, PrivacyNote.tsx, SourceLine.tsx, BenefitLink.tsx
  review/ ChangesTable.tsx, DependantDetails.tsx, BeforeYouConfirm.tsx, PayslipPreview.tsx
  tour/ TourProvider.tsx, TourOverlay.tsx, steps.ts
  ui/ Button.tsx, Chip.tsx, Segmented.tsx, Card.tsx, Badge.tsx
/lib
  engine/ pricing.ts, claims.ts, rules.ts, format.ts, *.test.ts
  ai/ systemPrompt.ts, tools.ts, scripted.ts
  store.ts                      # Zustand: persona, selection, proposal, status
  data.ts                       # typed loaders for /data JSON
/data
  employer.meridian.json
  scheme.axa-pmi.json
  plan-years.json
  scenarios.json
  personas/priya.json
  personas/tom.json             # optional second persona (phase 2)
/design-reference               # the approved canvas screens (.dc.html). Read-only reference.
DECISIONS.md                    # running log of judgement calls
```

---

## 6. Data model

Types live in `lib/data.ts`. Validate JSON with zod at load.

```ts
type Tier = 'core' | 'enhanced' | 'premium';
type Excess = 0 | 100 | 250 | 500;
type Outpatient = 500 | 1000 | 'full';
type Specialist = 'guided' | 'directory' | 'extended';
type Relationship = 'spouse' | 'civil_partner' | 'cohabiting_partner' | 'child';

interface Dependant { id: string; name: string; relationship: Relationship;
  source: 'hr_record' | 'added_by_member'; dob?: string; }

interface Selection { tier: Tier; excess: Excess; outpatient: Outpatient;
  specialist: Specialist; dependants: string[] /* dependant ids covered */; }

interface Persona { id: string; name: string; initials: string; age: number;
  postcode: string; taxRate: 0.2 | 0.4 | 0.45; band: string;
  focusAreas: string[];             // self-declared at Navigator onboarding
  peopleOnRecord: Dependant[];      // e.g. Sam (spouse, hr_record)
  currentSelection: Selection; }
```

### `/data/employer.meridian.json`
Branding (name, colours from §10), flex fund (`500`), employer contribution rule (`pays employee-only Core, directory, £0 excess, £1,000 outpatient = £900/yr`), enrolment window dates, demo today date, payroll note.

### `/data/scheme.axa-pmi.json`
- `options`: tiers, excess steps, outpatient steps, specialist options, each with label, one-line explanation (copy from the design reference hints) and loading factor (§7).
- `rates`: adult rate per tier: core 900, enhanced 1125, premium 1350; child = 40% of the adult rate.
- `features`: id, name, `focusArea` (for "Relevant to you"), and detail/status per tier or option (copy the feature list from `Benefit.dc.html`).
- `rules`:
  - eligible relationships: one partner (spouse, civil partner or cohabiting partner); children under 21, or under 25 in full-time education. Parents and other relatives are **not eligible** (with the explanation copy).
  - dependants added at enrolment join on **medical history disregarded** terms (state this as "Under Meridian's scheme rules…").
  - after the window closes, changes only after a qualifying life event (within 30 days); rejoining later may be underwritten.
  - excess: once per person per policy year; counts towards the outpatient allowance.
  - MRI/CT/PET scans paid in full at AXA scanning centres; inpatient and day-case paid in full.
  - physio via Muscles, Bones and Joints service: sessions per tier 10 / 15 / unlimited, no GP referral.
  - mental health outpatient limit per tier: £1,000 / £2,000 / paid in full.
- `policyText`: short citable passages (id, title, text) the AI can quote, e.g. excess, outpatient allowance, Guided, Extended cover, eligibility, pre-existing conditions, chronic conditions (PMI covers flare-ups and diagnosis, not routine management).

### `/data/plan-years.json`
2026–27 vs 2027–28 differences: mental health outpatient limit £750 → £1,000; Guided by AXA: not offered → new; physio 10 → 10; Core premium £900 → £900 (Meridian still pays).

### `/data/scenarios.json`
Scenario library (id, who: `member` | dependant id, title, focusArea, journey steps, cost inputs). See §8.

### Personas
- **Priya Shah** (primary): 34, London E8, Band C, 40% tax. Focus areas: "Mental health & wellbeing", "Bones, joints & muscles". People on record: **Sam Shah, spouse, from HR record, no DOB held**. Current: Core, just Priya, £0 excess, £1,000 outpatient, directory.
- **Tom Reid** (phase 2, optional): 47, Manchester M20, 20% tax, no dependants. Focus areas: "Fitness & nutrition", "Money management". Current: same as Priya's. Story: "I barely use this". He trades down or opts out and moves the saving to his Flex Fund (dental, pension or cash), and the AI warns about rejoining later.

---

## 7. Pricing and tax engine (`lib/engine/pricing.ts`)

Pure functions, fully unit-tested. **The UI and the AI tools both call this; nothing else computes money.**

```
adultRate        = rates[tier]
heads            = adultRate × (1 + partnersCovered) + adultRate × 0.4 × childrenCovered
loading          = excessFactor × outpatientFactor × specialistFactor
  excessFactor     {0:1.00, 100:0.95, 250:0.90, 500:0.85}
  outpatientFactor {500:0.90, 1000:1.00, full:1.10}
  specialistFactor {guided:0.90, directory:1.00, extended:1.15}
premium P        = heads × loading                      (annual)
employerPays     = min(P, 900)
flexFund         = 500 + (900 − employerPays)           (downgrade savings return to the fund)
fromFund         = min(P − employerPays, flexFund)
fromPay          = P − employerPays − fromFund          (annual, deducted from net pay)
unusedFund       = flexFund − fromFund
taxableBenefit   = P − fromPay                          (member contributions reduce the taxable value)
incomeTax        = taxableBenefit × taxRate             (annual)
realMonthlyCost  = (fromPay + incomeTax) / 12
fundAsCashMonthly= fromFund × (1 − taxRate) / 12        (what using the fund "costs" vs taking cash)
```

Round only for display (`format.ts`): monthly to 2 dp (£51.50), annual to whole pounds (£1,458).

### Required test cases (Priya, 40%)

| Selection | Premium | From pay /mo | Tax /mo | Real cost /mo |
|---|---|---|---|---|
| Current: Core, just Priya, £0, £1,000, directory | £900 | £0.00 | £30.00 | **£30.00** |
| Add Sam only (Core, £0, £1,000, directory) | £1,800 | £33.33 | £46.67 | **£80.00** |
| **Lean**: Core, Priya + Sam, £250, £1,000, guided | £1,458 | £4.83 | £46.67 | **£51.50** |
| Enhanced, Priya + Sam, £250, full, directory | £2,227.50 | £68.96 | £46.67 | **£115.63** |
| Current + one child | £1,260 | £0.00 | £42.00 | **£42.00** |

Also test: the excess saving on the lean plan is £162/yr (£13.50/mo) versus £0 excess, so it pays off if you claim less than once every ~18 months. Note that the tax is the same (£46.67) in the Sam-only and lean rows: the taxable value equals what Meridian and the Flex Fund pay, so every pound cut from the premium comes straight off the payslip deduction. **This is a key insight the AI should surface.**

### Claims engine (`lib/engine/claims.ts`)
`memberPays(scenario, selection)`:
- excess once per person per year (scenarios priced on their own include it; the "all four in one year" total charges it once per person)
- outpatient: `excess + max(0, outpatientCost − allowance)` where the allowance includes the excess; `full` → excess only
- scans, inpatient, day-case: £0
- physio: sessions beyond the tier limit × £60, plus the excess
- mental health: cost beyond the tier's MH limit, plus the excess
- dependant not covered → full private cost, with the note "Sam isn't covered: pay privately or wait for the NHS"

---

## 8. Scenarios (must match these numbers)

Plans compared: **Keep as is** (current, £30.00/mo) · **Add Sam, lean** (£51.50/mo) · **Enhanced** (Enhanced, Priya + Sam, £250, full, directory: £115.63/mo).

| Scenario | Why shown | Keep as is | Lean | Enhanced |
|---|---|---|---|---|
| Priya: knee injury needing surgery (consultations and tests £1,300; MRI and day-case surgery paid in full) | "You told us bones, joints & muscles matter" | £300 | £550 | £250 |
| Sam: asthma flare-up, specialist review (£650) | "You mentioned Sam's asthma in chat" | £650 (not covered) | £250 | £250 |
| Priya: 8 sessions of talking therapy (£960) | "You told us mental health matters" | £0 | £250 | £250 |
| Priya: back pain, 14 physio sessions (£60 each) | "You told us bones, joints & muscles matter" | £240 | £490 | £250 |
| **If nothing happens this year** (deductions + tax) | | £360 | £618 | £1,388 |
| **If all four happened in one year** (excess once per person) | | £1,550 | £1,658 | £1,888 |

Headline the AI states: adding Sam the lean way costs £258 a year more than today; even if all four happened in one year, Enhanced would still cost £230 more overall. Scenarios are chosen from the persona's focus areas plus anything mentioned in chat.

---

## 9. Screens and behaviour

**The `/design-reference/*.dc.html` files are the approved designs.** Match their layout, hierarchy and copy closely. Ignore their internal `<x-dc>`/`{{ }}` templating; it's a design-tool format. Unlike the canvas, all screens here share **one plan state** (Zustand): accepting a change in chat updates the PMI page, scenarios and review.

### Shell (every page) - mirrors Euphoric's Navigator
Left sidebar: brand tile "M" + "Meridian Benefits"; a **"Search or ask"** box that opens the Ask AI pop-up; nav: Home, Benefits, Store, Recognition, My choices, Total rewards, Saved (Store, Recognition, Total rewards and Saved can be simple "Not part of this prototype" placeholders); bottom: a "100 to spend" points pill (recognition points, kept separate from the Flex Fund on purpose) and the user (Priya Shah). On narrow screens the sidebar collapses into a top bar.

### Home `/` (`Main.dc.html`)
Brand-tint hero: "Hi Priya, / Ready to explore your benefits?" with a large AI input (rotating placeholder prompts, submits to chat). Then an **"Action needed"** card: "Enrolment closes in 9 days", "Sam isn't on your health cover", source line "Sam is listed as a dependant in your HR record", buttons "Review my health cover" and "Remind me tomorrow". A side column with "What's changed in your health cover for 2027–28" and "Sam isn't named on your life assurance". Then "Based on your recent activity" and "Top benefits for you" card rows.

### PMI page `/benefits/pmi` (`Benefit.dc.html`) - the centrepiece
- Header band (brand tint), breadcrumb, AXA tile, "Private Medical Insurance", pill "Enrolment open until 31 March".
- **Nudge** (when Sam isn't covered): "Sam is listed as your spouse but isn't on your health cover…" with [Add Sam] [Talk it through].
- **Your cover for April 2027 to March 2028**:
  - **Quick choices**: Keep my current cover (one tap, shows a green "Your cover stays as it is from 1 April. Saved to My choices." with Undo) · Add family · Help me choose (→ chat).
  - **Who's covered**: Priya (always), Sam from the HR record (dashed "not covered" row with "Add · £X a month", where X is the cost difference from the engine), added children, "+ Add someone" → Child (name + DOB form, validated) / Partner (one-partner rule) / Parent / Someone else (not-eligible explanation plus "Talk through other options"). Note under the list: "Under Meridian's scheme rules, anyone you add at enrolment joins with their medical history ignored…".
  - **Fine-tune your cover** (collapsed; one-line summary + "Adjust"): cover level, excess, outpatient allowance, choosing your specialist, each with a sparkle hint that updates with the selection.
- **What's changed since last year** (from `plan-years.json`) with the source line.
- **What your choices include**: 8 features sorted by focus areas, "Relevant to you" tags, status chips (Included / Limited / Not on your plan), purple highlight on features that differ from the current plan.
- **Common questions**: 5 rows, each with a personalised one-line answer; clicking opens the Ask AI panel on that question.
- **Your cover from 1 April** (sticky right panel): status chip (No changes / N changes to confirm / Confirmed), **real monthly cost** large, "Keeping your current cover: £30.00 a month", breakdown (premium, Meridian, Flex Fund, from pay, income tax), Flex Fund bar plus the cash note, deadline, [Review and confirm], Reset, footer "Guidance, not financial advice… No AXA login needed: we update AXA and payroll for you."
- **Floating "Ask AI about this benefit"** pill → panel styled like Navigator's search pop-up: search input, question shown as a dark pill, short answer, optional result card (e.g. "You'd pay £300"), inline benefit links (AXA tile + underlined name), privacy note when health is involved, source line, "Suggested questions" (sparkle rows), "Continue in Chat".

### AI plan builder `/benefits/pmi/chat` (`Builder.dc.html`)
Split: conversation left, **live plan** right. Opens with a member context card: "Here's what I already know… Is it still right?" (age, postcode, tax rate, family on record, cover today, Flex Fund, focus areas) with [Looks right] [Something's changed]. Free text plus suggestion chips. When the AI calls `propose_plan_change`, render a **ProposalCard** (changes list, new monthly cost vs a simpler alternative, [Accept all] [Compare alternatives]); the live plan shows pending differences in purple with old values struck through; Accept applies them to the store, with Undo. The live plan shows a premium split bar (Meridian / Flex Fund / your pay), the real cost and the "worth knowing" warning.

### Scenario explorer `/benefits/pmi/scenarios` (`Scenarios.dc.html`)
AI summary at the top, a comparison grid (scenario rows × plan columns, plan headers selectable to highlight), the "why shown" tag per scenario, totals rows, an "ask your own what-if" input (sends to chat), [Continue with {plan}] which applies that plan and goes to review. Use the current store selection as the "proposed" column when it differs from the lean plan.

### Review `/benefits/pmi/review` (`Review.dc.html`)
Everything is computed from the store: what's changing (Now vs From 1 April), dependant details (name and relationship pre-filled read-only; **DOB required** for dependants without one, validated DD/MM/YYYY with an inline error), "Before you confirm" (hard to undo, excess, Flex Fund, Guided if chosen), a guidance checkbox (required, inline error), [Confirm my choices] + "Done here. No AXA login needed." Right column: **April 2027 payslip preview** (taxable medical benefit, deduction, tax, less in your pocket; Now vs April) and "What happens next" timeline. Confirmed state: "You and Sam are covered from 1 April", "Saved to My choices" and "Updated in Total rewards" cards, an AI follow-up about the life assurance beneficiary, Undo.

### My choices `/my-choices`
A simple list of confirmed elections with the effective date, plus "Change until 31 March".

### Notes for reviewers `/about`
Linked from the sidebar footer and the tour end. Sections (keep the placeholder text marked `TODO(owner)` for the author to finish): How I read the brief · What I researched · Assumptions · What's real vs mocked · Key design decisions · What I'd build next · Part 2 ideas.

---

## 10. Design tokens (from the design reference)

- Font: **Inter** 400/500/600. Base 14px; headings 18–28px, weight 600, slight negative letter-spacing. Sentence case everywhere. UK English.
- Text #141414 · secondary #4A4A4A / #5F5F5F · muted #6B6B6B (only for ≥12px metadata).
- Borders #ECECEC (cards), #DADADA (controls), #F0F0F0 (dividers).
- Brand (Meridian): tile #1F5C4E, tint #E9F1EE, tint border #C9DDD6, fund bar #1F5C4E / #8FBFAE.
- Primary button: #141414 bg, white text, radius 10px, min-height 44px. Secondary: white bg, #DADADA border.
- **AI accent (use only for AI elements):** text #4B36C4, icon #5B45D6, bg #F2EFFD, soft bg #FAF9FF, border #D9D2FA, highlight border #B9ACF5.
- Status: success text #1D5E35 on #EAF5EE (banner #EEF8F1 / #BFE3CC); warning text #7A4300 on #FFF3DC / #FFF6E5; error #B42318.
- Radii: cards 16px, inner cards 12px, controls 10px, pills 999px. Shadows only on the floating AI pill and panel.
- AXA tile: #00008F, white bold "AXA".
- Spacing: page padding 48px desktop; card padding 22–26px; section gap 20px.

---

## 11. AI layer

### Endpoint `app/api/chat/route.ts`
`streamText` with the Anthropic provider, `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`), temperature 0.3, max output ~600 tokens, `maxSteps` 4. Simple per-IP rate limit (e.g. 30 requests per 10 minutes) and a hard per-session message cap. Never expose the key to the client.

### System prompt essentials (`lib/ai/systemPrompt.ts`)
- You are the benefits guide inside Meridian Benefits (Navigator), helping {persona} with AXA Private Medical Insurance during enrolment (closes 31 March 2027; cover from 1 April 2027).
- Use tools for every fact about options, prices, tax, rules and scenarios. Never state a number you didn't get from a tool.
- Only propose combinations of options that exist in the scheme. To change the plan, call `propose_plan_change`; never claim a change is made until the user accepts.
- Guidance, not advice: explain trade-offs and consequences, cite the policy text, let the user decide.
- Mention hard-to-undo consequences before the user commits.
- If the user shares health information, acknowledge it, use it only for this conversation, and include the privacy note.
- Be warm, plain and short: 2–4 sentences, then a card or a question. UK English. No jargon without a one-line explanation.
- If asked about anything outside PMI, answer briefly and point to the relevant Navigator area.

### Tools (`lib/ai/tools.ts`, zod schemas, all deterministic)
| Tool | Returns |
|---|---|
| `get_member_context()` | persona facts, people on record, focus areas, current selection, deadline |
| `get_scheme_options()` | available options with explanations, eligibility rules |
| `price_plan(selection)` | full engine breakdown (§7) |
| `compare_plans(selections[])` | breakdowns side by side |
| `propose_plan_change(changes[], rationale)` | a proposal object the UI renders as a ProposalCard (not applied) |
| `run_scenarios(selections[], scenarioIds?)` | claims engine results (§8) |
| `compare_plan_years()` | `plan-years.json` differences |
| `search_policy(query)` | matching `policyText` passages with ids, for citations |
| `check_eligibility(relationship, age?)` | eligible true/false + explanation |

### Scripted fallback (`lib/ai/scripted.ts`) - required
If `ANTHROPIC_API_KEY` is missing, the call errors, or the **guided tour** is running, use scripted responses: intent matching on the suggested questions and the tour steps, with the same tool calls run locally so cards and numbers render identically. Stream them with a short typewriter effect so they feel live. Free typing that doesn't match gets a polite generic answer plus suggestion chips. **The tour must be 100% deterministic.**

### Canonical opening exchange (scripted and used in the tour)
User: "Yes. I want Sam on my cover without it costing a fortune. He has asthma, does that matter?"
AI: enrolment is open until 31 March so he can be added now; under Meridian's scheme rules, anyone added at enrolment joins with their medical history ignored, so asthma isn't excluded; PMI covers flare-ups and diagnosis, not routine ongoing care (that stays with his GP); privacy note; then `propose_plan_change` → **"Add Sam, keep it lean"**: add Sam, excess £0 → £250, specialist "Your choice" → "Guided by AXA"; £51.50 vs £80.00 if you just add Sam; then the note on why the tax doesn't change.

---

## 12. Guided demo mode (critical: reviewers see this without us)

- Landing (`/`) shows a dismissible card in the bottom-left corner: **"Take the 3-minute guided tour"** [Start tour] [Explore freely]. Also `?tour=1`.
- Tour overlay: a spotlight on the target element plus a caption card (bottom-right) with **step x of n**, a bold one-line **"What's happening"**, one line of **"Why it matters"**, and [Back] [Next] [Exit tour]. Next performs the step's action (navigate, click, type a message, accept a proposal) so the reviewer just keeps clicking Next.
- Keyboard: → / ← / Esc. Works at 1280px+; on smaller screens, captions only.
- **Tour A - Priya adds Sam (about 12 steps):**
  1. Home: the nudge spots a gap, Sam on record but not covered (privacy-respecting, no life-event inference).
  2. Open the PMI page: the "Your cover" panel replaces the old external "Manage benefit" link.
  3. Quick choices: most people keep their cover or add family; one tap each.
  4. Add Sam: cost updates live: £30.00 → £80.00, with the breakdown.
  5. What's changed since last year: reuses GAP's plan-year comparison.
  6. Ask AI panel: "What would a knee operation cost me?" → personalised answer with a card.
  7. Help me choose → chat opens with "Here's what I already know".
  8. User message about Sam's asthma → AI answer + privacy note.
  9. ProposalCard: £51.50 vs £80.00; the tax insight.
  10. Accept → the live plan updates; open scenarios.
  11. Scenarios: Enhanced would still cost £230 more even if all four happened.
  12. Review: payslip preview (payrolling from April 2027), warnings, DOB, confirm → confirmed; end card linking to "Notes for reviewers".
- **Tour B - Tom trades down (phase 2, about 5 steps):** switch persona → PMI page → "I barely use this" in chat → proposal (higher excess + Guided, or opt out) with the Flex Fund reallocation and the rejoining warning → confirm.
- A small **persona switcher** (Priya / Tom) appears in the user menu only after phase 2.

---

## 13. Copy rules

Sentence case. UK English (enrol, programme, organisation). Money as £51.50 a month / £1,458 a year. Verbs on buttons. No "simply", "just", "please", or exclamation marks in system copy. Always state where a fact came from when it's personal ("from your HR record", "you told us"). The AI says "I"; the system UI never does.

---

## 14. Deployment

- Vercel project; env: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, optional `DEMO_PASSCODE`.
- If `DEMO_PASSCODE` is set, middleware shows a minimal passcode screen (cookie for 7 days). Don't use Vercel's account-based protection, because reviewers won't have Vercel accounts.
- `noindex` meta and `robots.txt` disallow.
- The app must work fully **without** an API key (scripted mode) and show a subtle "Demo mode" badge in that case.

---

## 15. Build order and definition of done

1. Scaffold, tokens, shell, routes with placeholder content.
2. Data JSON + zod types + pricing/claims engines + **all §7/§8 tests passing**.
3. PMI page complete with live state.
4. Ask AI panel + `/api/chat` with tools + scripted fallback.
5. Chat builder with ProposalCard and the live plan.
6. Scenarios. 7. Review + confirmed state + My choices. 8. Home.
9. Guided tour A. 10. Notes for reviewers page. 11. Polish, accessibility pass, responsive check, deploy.
12. (Optional) Tom persona + tour B.

**Done means:** `npm run build` and `npm test` pass; every number in §7/§8 appears correctly in the UI; tour A runs end to end with no API key; keyboard-only navigation works through the tour and the main flow; no console errors; Lighthouse accessibility ≥ 95 on the PMI page; deployed URL works in a fresh incognito window.

## 16. Don'ts

- Don't let the LLM produce numbers, options or eligibility on its own.
- Don't restyle Navigator (no gradients, no glassmorphism, no emoji, no new colour themes).
- Don't add real client names, real insurer logos or anything from the confidential videos.
- Don't block the demo on the API.
- Don't over-build pages outside the flow (Store, Recognition, etc. stay as placeholders).
- Keep `DECISIONS.md` updated with any judgement calls.
