# Decisions

Judgement calls made where CLAUDE.md or the design reference was ambiguous or silent. CLAUDE.md wins when the two disagree (CLAUDE.md, top of file).

## Setup

1. **Design reference was double-nested.** The zip unpacked to `design-reference/design-reference/`. I flattened it to `/design-reference` as CLAUDE.md §5 expects.
2. **Package versions: latest stable at the time of the scaffold.** Next 16, React 19, Tailwind 4, zod 4, Zustand 5, Vitest 5, TypeScript 7. The AI SDK, Radix and Framer Motion are deferred to the build steps that need them (3–5), to keep steps 1–2 lean.
3. **Tailwind 4 has no `tailwind.config`.** The §10 tokens live in `app/globals.css` under `@theme`. That one block gives both CSS variables (`--color-ai-text`) and utilities (`text-ai-text`), which satisfies "tokens in config / CSS variables".
4. **Base styles sit in `@layer base`.** Otherwise the design's global `a { color }` rule beats Tailwind's layered utilities, and white button text turns black.
5. **Narrow-screen breakpoint is 900px** (taken from PROMPTS.md). Below it, the sidebar becomes a top bar with a menu button.

## Data model

6. **Option values follow CLAUDE.md, not the canvas.** The canvas uses `enh`/`prem`/`dir`/`ext`. The code uses the §6 enums: `enhanced`/`premium`/`directory`/`extended`.
7. **Focus areas are stored as display labels** ("Mental health & wellbeing"), matching the §6 example. Each feature's and scenario's `focusArea` uses the same label, so matching is a plain string compare.
8. **Persona fields beyond §6:** `firstName` and `area` ("London"), needed for copy such as "E8, London". Tom's band ("B") is assumed, since CLAUDE.md doesn't give one.
9. **Features with a per-option detail or status** store a map keyed by the option they depend on (`dependsOn: tier | outpatient | specialist`). The copy is taken verbatim from `Benefit.dc.html`.
10. **Claims limits live in the scheme JSON** (`limits`): physio sessions per tier (`null` means unlimited), £60 per session, and the mental health outpatient limit per tier.
11. **Knee scenario "paid in full" amount is £10,000.** This is an assumption so the journey's typical cost reads "over £11,000" as in the canvas. It never affects what the member pays.
12. **Sam's asthma scenario has a `mentionKey: "asthma"`.** It is shown only once asthma has been mentioned in chat, and only for someone who can be covered. The other scenarios come from the persona's focus areas (§8).

## Pricing and tax engine

13. **Rounding is half-up with a tiny epsilon** to absorb binary float error: £115.625 → £115.63, £1,387.50 → £1,388. Rounding happens only in `format.ts`.
14. **The premium can show pence.** §7 says annual figures display in whole pounds, but the §7 table shows a premium of £2,227.50. `formatAnnualExact` keeps pence only when there are some. Every other annual figure is whole pounds.
15. **The employer cap is a flat £900 whatever the tier**, per the §7 formula `min(P, 900)`. Below £900, the unused contribution goes into the Flex Fund (tested with a £688.50 plan).
16. **`price()` throws if a selection covers a dependant who isn't on record.** A wrong plan should fail loudly, not be priced silently.
17. **Headline differences use the displayed whole-pound totals.** "Enhanced costs £230 more" is £1,888 − £1,658. The unrounded difference is £229.50, which could otherwise show as £229 or £230 depending on float error, and must match the table.
18. **Excess break-even:** £250 ÷ £162 a year ≈ 18.5 months, reported as "~18 months" per §7.

## Claims engine

19. **The member never pays more than the journey costs.** The excess is capped at the covered portion of the claim.
20. **Mental health and physio have their own limits, separate from the outpatient allowance.** This is what makes 8 therapy sessions £0 on today's Core plan (within the £1,000 mental health limit), as §8 requires.
21. **"All in one year" charges each person's excess once.** For each person, the total is the largest excess paid on any one claim plus everything over the limits. A not-covered dependant pays the full private cost. Known simplification: outpatient allowances are not pooled across one person's separate claims. Each person in the §8 library has only one outpatient-allowance claim, so the numbers are unaffected.

## Rules

22. **The one-partner rule counts people on record, covered or not.** Sam is Priya's spouse on her HR record, so adding another partner is refused with "Sam is already listed above as your spouse" (canvas copy).
23. **Child age limits:** eligible while under 21, or under 25 in full-time education (aged 21 is not eligible). `ageOn()` exists so the UI can measure age at cover start, 1 April 2027.
24. **Date of birth validation is stricter than the canvas:** DD/MM/YYYY, a real calendar date, and not in the future. The canvas checks the format only.
25. **"9 days left"** is the calendar-day difference between 22 and 31 March.

## Shell and routes

26. **Placeholder areas get their own routes:** `/store`, `/recognition`, `/total-rewards` and `/saved`, all showing "Not part of this prototype". They aren't listed in §5, but the sidebar needs somewhere to link.
27. **"Search or ask" links to the plan builder for now.** It becomes the Ask AI pop-up in build step 4.
28. **"Notes for reviewers" is linked from the sidebar footer**, above the user, as §9 describes.
29. **Main-flow pages are labelled placeholders** ("Placeholder · built in step N") until their build step. The PMI placeholder already reads its £30.00 from the engine to prove the wiring. `/api/chat` returns 501 until step 4.
30. **Icons:** lucide equivalents of the canvas's hand-drawn nav icons (House, Badge, Tag, PartyPopper, Bookmark, CirclePlus, Heart) at 1.8 stroke.

## Step 3: PMI page and store

31. **The store is rehydrated after mount** (`skipHydration` plus `<StoreHydrator/>`). Reading sessionStorage during the first render would make the server and client HTML differ and log hydration errors. The cost is one frame showing the default plan.
32. **The store holds no money.** Every screen prices `selection` through `usePlanPricing`, so the PMI page, chat and review can't drift apart.
33. **"Keep my current cover" counts as confirmed** ("Confirmed" chip, saved to My choices), as in the canvas. Undo restores whatever the plan was before the tap, including added children.
34. **The child form asks for name and date of birth** (the canvas asks for name only), plus an "In full-time education" tick box so the under-25 rule can be applied. Eligibility is checked on the age at cover start, 1 April 2027.
35. **"Add family" opens the add-someone picker** in Who's covered and moves focus there, rather than opening a separate screen.
36. **The Flex Fund bar reads "£X of £{fund}"**, where the fund includes any downgrade saving, instead of a fixed "of £500".
37. **Radix and Framer Motion are not used yet.** Fine-tune uses a native `aria-expanded` disclosure and the Ask panel a hand-rolled non-modal dialog. Both are lighter, accessible, and enough for the prototype.

## Step 4: Ask AI panel, /api/chat and scripted fallback

38. **The endpoint streams its own small NDJSON event format** (`text`, `part`, `mode`, `done`) instead of the AI SDK's UI message stream, and the client doesn't use `@ai-sdk/react`. The live model path (`streamText` + tools) and the scripted path produce exactly the same events, so cards and numbers render identically, and the client can run the script locally when the network fails. `ai` and `@ai-sdk/anthropic` are still used for the live path.
39. **AI SDK v7 API:** `stopWhen: stepCountIs(4)` replaces `maxSteps`, and tools use `inputSchema`. Temperature 0.3, at most 600 output tokens.
40. **Fallback order:** no key → scripted. Rate limit (30 requests per 10 minutes per IP) or message cap (40) → a scripted "limit reached" reply. Live call fails before any output → scripted reply for the same question. It fails mid-answer → a short apology. The request itself fails → the client runs the script locally. The guided tour always runs the script locally.
41. **The privacy note is added by code, not by the model.** A regex spots personal health disclosures ("asthma", "diagnosed"…) in the user's message. The model is told the app adds the note, so it doesn't have to remember to.
42. **The model never sees the whole store:** the client sends the plan on screen, people the member added and chat mentions. The server rebuilds people from the persona file and drops any dependant ids it doesn't know.
43. **Tool outputs are pre-formatted strings** ("£51.50") so the model quotes figures exactly instead of rounding them itself.
44. **Proposal "alternative":** when a proposal changes who's covered and some options, the comparison is "if you just add Sam" (same people changes, no option changes). When it only changes options, it's "if you keep things as they are". The tax note is added only when the tax really is unchanged and the proposal is cheaper.
45. **The Ask panel shows only the latest exchange**, like Navigator's search pop-up. It shares one conversation with the chat page, so "Continue in Chat" carries everything over.
46. **"Demo mode" badge** shows when `GET /api/chat` reports no key. With a key set it's hidden even if calls later fail, because those failures fall back silently.
47. **Pronouns for Sam** ("his GP") come straight from the approved canvas copy for this fictional persona.

## Step 5: AI plan builder

48. **The live plan shows the pending proposal over the current plan**: changed rows in purple with the old value struck through, the cost as "£30.00 → £51.50", and the status as "N suggested changes". After Accept it shows the applied plan as "Updated, not yet confirmed".
49. **Accepting adds a deterministic follow-up message** ("Done. Before you confirm…" with Show me scenarios / Go to review) from the client, not from the model, so it's identical in live and scripted modes.
50. **Only one proposal can be pending.** A newer proposal replaces it, and the older card says "Replaced by a newer suggestion" instead of offering a second Accept.
51. **"Worth knowing before you commit"** is built from the plan shown, not from the model: the excess with its engine saving and break-even, Guided if chosen, and the Flex Fund given up if all of it is used.
52. **Suggestion chips:** the opening chip "Add Sam without it costing a fortune" goes through the same intent as the canonical message. Chips already sent are hidden, and on phones they scroll in one row so the composer stays visible.
53. **Not tested against a real model:** no Anthropic key is available in the build environment. The keyed path was exercised with an invalid key: the request reached Anthropic, was rejected, and fell back to the scripted reply with identical cards and numbers. Run one real-key check before submitting (see the summary).

## Step 6: Scenario explorer

54. **The middle column is the lean plan**, unless the plan on screen is none of the three library plans. Then it becomes "Your plan · Your current choices" (§9).
55. **Scenario rows follow §8's rule literally:** focus-area scenarios always appear; Sam's asthma appears only once asthma has been mentioned in chat. Totals and the headline adapt ("all three" / "all four"). In the tour, asthma is mentioned, so the page shows exactly the §8 table.
56. **The headline is generated from the engine** with whole-pound differences (£258, £230), so it can never disagree with the table.
57. **The opening chat chip sends the full canonical message**, which mentions Sam's asthma. Bug found in testing: a shorter chip got an asthma-specific reply without ever mentioning asthma. The scripted reply now mentions asthma (and adds the privacy note) only when the member did.
58. **"Ask your own what-if" sends the question to the plan builder** and opens it, rather than adding a custom row. Custom scenarios would need the AI to invent costs, which §2.2 rules out.
59. **"Continue with {plan}" applies that plan as the draft** and goes to review. Nothing is confirmed until the member confirms there.

## Step 7: Review, confirmed state and My choices

60. **Dates of birth and the guidance tick live in the store**, so a confirmed plan keeps Sam's date of birth if the member undoes and re-confirms. The tour can also fill them in like a member would.
61. **The review asks for a date of birth only for covered people without one** (Sam, from the HR record). Children added on the PMI page already gave theirs. Validation: DD/MM/YYYY, a real date, not in the future.
62. **"Before you confirm" is generated from the plan:** hard to undo (always, plus the rejoining rule for anyone newly added), the excess if any, the Flex Fund if used (with the cash equivalent from the engine), and Guided if chosen.
63. **The payslip preview shows "Now" as today's cover and "April" as the plan being confirmed**, all monthly, from the engine (taxable benefit £75.00 → £116.67).
64. **"Keep my current cover" counts as confirmed**, so the review screen then shows the confirmed state. Undo there restores whatever the plan was before.
65. **"Add 1 April to my calendar" downloads a small .ics file.** "Review my life assurance" links to Benefits, because life assurance is outside this prototype.
66. **My choices lists the confirmed election only**, with the real monthly cost and "Change until 31 March". Unconfirmed drafts don't appear there.

## Step 8: Home

67. **The "Action needed" card follows the plan state:** gap ("Sam isn’t on your health cover") → draft ("Finish adding Sam", linking to review) → confirmed ("Your health cover is confirmed for 1 April"). It never infers anything beyond the HR record.
68. **The hero input sends the typed question to the plan builder and opens it.** An empty submit just opens the builder. Placeholder prompts rotate every 3.5 seconds, except with reduced motion.
69. **"Remind me tomorrow" only acknowledges** ("We’ll remind you tomorrow."): there's no notification system in the prototype.
70. **The carousel arrows on "Based on your recent activity" are left out:** buttons that do nothing would mislead reviewers.

## Step 9: Guided tour A

71. **13 steps rather than "about 12":** confirming is its own final step after the review step, so the payslip and the confirmed state each get a caption.
72. **The tour starts from a clean plan** (`resetAll`) so every run is identical. It keeps the "Explore freely" dismissal, and it always uses the scripted AI locally: in testing, zero `/api/chat` requests were made during the tour.
73. **Every step's action can safely run twice** (cover Sam, ask once, send once, accept if pending, unconfirm when going back to review), so Back and Next can never put the plan into a state the captions don't describe.
74. **Caption numbers are computed from the engine and the store when shown** (£30.00 → £80.00, £300, £51.50 vs £80.00, £230), never typed into the copy.
75. **In the tour, Sam is added on the PMI page before the chat.** So the AI's lean proposal changes only the excess and the specialist ("2 changes", "Accept both"), still priced £51.50 against £80.00 "if you just add Sam". Without the tour, it's the three-change version from the canvas.
76. **Spotlight and caption placement:** targets are scrolled to near the top of the screen, and the caption goes bottom-right or bottom-left, whichever overlaps the spotlight less. Below 1280px there's no spotlight, only captions. The page stays clickable throughout.
77. **Start:** the bottom-left "Take the 3-minute guided tour" card on Home, or `?tour=1` on any page. **Keyboard:** → / ← / Esc. Focus moves to Next after each step.
78. **Flakiness check:** five automated end-to-end runs with no API key: three standard (including keyboard-only from `?tour=1`, and Back from step 7 to step 6 and forward again), one with the CPU slowed 6×, and one at 1024px. All passed with no console errors. An earlier test exercised Back/Next on steps 6–7 dozens of times without breaking state.

## Steps 10–11: Reviewer notes, polish, accessibility, deployment

79. **Reviewer notes keep `TODO(owner)` in every section**, with a one-line prompt above each saying what belongs there. The page also links to the tour and the PMI page.
80. **Polish pass against the rendered design files:**
    - The PMI header band overlaps the first cards, and the status pill has a dot.
    - The nudge is a white card, and "Talk it through" is styled as an AI action.
    - Who's covered is one grouped list with text-style Remove.
    - What's changed uses rows.
    - The cover panel breakdown is split into two groups.
    - The privacy note is a green lock line.
    - The proposal card shows its prices inline, with the tax note in a grey box below.
    - The first follow-up action is the primary button, and the builder chips are neutral.
    - "Before you confirm" is one amber card.
    - On the confirmed state, the calendar is the primary button and Undo is a link.
81. **Sticky cost bar on phones (PMI page):** below 1024px the cover panel falls to the bottom of a long page. A compact bar keeps the real monthly cost and status visible (§2.5), and the Ask pill sits above it.
82. **Passcode gate uses Next 16's `proxy.ts`**, which replaces `middleware.ts`. It's active only when `DEMO_PASSCODE` is set. A plain form post (works without JavaScript) sets an httpOnly cookie holding a SHA-256 of the passcode, for 7 days. API routes return 401 instead of redirecting, and `next` is restricted to same-site paths.
83. **Noindex everywhere:** the robots meta tag, `robots.txt` disallow, and an `X-Robots-Tag: noindex, nofollow` header on every response. Lighthouse's SEO score is low only because of this, which is intended.
84. **Accessibility results:** axe-core (WCAG 2.1 A/AA plus best practice) finds no violations on any route or state checked, including the open Ask panel, a proposal, the error and confirmed states, and the tour. Lighthouse accessibility on the PMI page scores 100. One fix was needed: a heading-level skip on the proposal card.

## After deployment: live AI fix

85. **Bug found on the live deployment:** with a real key, answers came back with tool calls but no text, so the member saw an empty message. With a 4-step limit and no instruction to finish, the model could spend every step calling tools. Fixes:
    - The member's facts go into the system prompt, saving a tool round.
    - The prompt asks for parallel tool calls and an answer within two rounds.
    - The limit is 5 steps, and the 5th step forbids tools (`prepareStep` → `toolChoice: 'none'`), so it must answer. That keeps §11's four rounds of tool calls.
    - Safety net: a live reply that still has no text uses the scripted answer, or a plain line if a proposal card was already shown.
    The live path now lives in `lib/ai/live.ts`, with mock-model tests for each case.
86. **Live answer quality, found by testing the deployment with the real model:**
    - The eligibility tool counted Sam against the one-partner rule when asked about Sam himself, and the model quoted that internal message. It now takes `personId`.
    - The prompt now asks for plain text under 80 words, never mentions tools or internal checks, and weighs focus areas when trimming cost. The model had cut the outpatient allowance for a member who cares about bones and joints.
    - Markdown is rendered safely (bold, bullets) in case the model uses it anyway.
    - Pricing one situation on one plan now shows the "You'd pay" card in live mode too.
    - The Demo mode badge no longer calls the API from the passcode page, which logged a 401.

## Part 2 · §1, §2, §6: Demo room, routes and notes

87. **The sidebar hides itself on `/`, `/notes/*` and `/passcode`** instead of moving every Navigator route into a route group. One small check, and no file moves.
88. **Home moved to `/home`.** The sidebar Home item, the brand tile and tour A's first step point there. The old "Take the 3-minute guided tour" card on Home is gone (the demo room does that job), and `?tour=1` still works on any Navigator page. The demo room's tour button goes to `/home?tour=1`.
89. **Tour A's end card** now links to "Read my notes" (`/notes/flex`) and "Back to demo room" (`/`), as PART2.md §1 asks. `/about` (and `/notes`) redirect to `/notes/flex`.
90. **Notes are copied by running the design file's own `notes` array** and writing it to `data/notes.json`, so the wording is exactly as written. The design-tool `tour` field (e.g. `Main.dc.html`) became `tourHref` with our routes. A zod schema validates the file at load.
91. **Demo room preview figures come from the engine**: £51.50, £80.00, "3 changes" and the premium split bar.
92. **`/pay` and `/claims` are simple placeholders for now**, each linking to its notes. Their tour buttons (`?tour=1`) go to those placeholders until Tours P and C are built.

## Part 2 · §3–§5, §7: Your pay, Claim it and tours P and C

93. **All copy lives in `data/pay.april-2027.json` and `data/claims.json`**, taken from the designs and validated with zod in `lib/part2.ts`. The payslip lines are stored as display strings exactly as designed, including "—" and the tax codes.
94. **The arithmetic is tested, including against Part 1:** +104.40 − 48.33 − 21.50 − 5.22 = +29.35; 180, 83.33 and 9 after 40% tax and 2% NI; 500 − 45 − 25 = 430; 430 − 189 = 241; 189 × 0.58 = 109.62. The −£21.50 health cover effect equals the Part 1 engine's extra tax (£16.67) plus the £4.83 deduction, and the £116.67 medical benefit matches the Part 1 payslip preview. 1167L = 1257L less the £900 benefit.
95. **Page state lives in a small in-memory store (`lib/part2Store.ts`)** rather than in components, so tours P and C drive the real UI with the same actions a person would take. It isn't persisted: Part 2 is a fixed scripted story.
96. **The two payslip questions always use the scripted answers** (word for word from PART2.md), even when an API key is set, so Part 2 never calls the API. In the Ask panel on `/pay`, the suggested questions are the payslip ones.
97. **The physio excess comes from Priya's confirmed Part 1 plan**, defaulting to £250 (the lean plan) when nothing is confirmed. With £0 the copy says AXA should pay the invoice in full.
98. **"Add a receipt" opens a real file picker**, but any file maps to the glasses demo after a 900ms "Reading your receipt…" shimmer. "Continue on AXA’s site" opens an in-app "You’re leaving Meridian Benefits for AXA Health" dialog and never a real URL. "Copy details" writes to the clipboard and shows a "Copied" toast even if the clipboard is blocked.
99. **"View full payslip" opens a modal** with the lines that changed and a note that unchanged lines are left out. Inventing a full payslip would add numbers that nothing checks.
100. **One TourProvider runs three tours.** `?tour=1` picks the tour from the page (`/pay` → P, `/claims` → C, otherwise A), then removes the parameter so it can start again later in the same visit. This was a bug: "Next: Claim it tour" didn't start because the old starter fired only once per visit. Captions now read "Guided tour · Step x of n", and each tour has its own end-card links.
101. **Flakiness check:** tours P and C each ran end to end twice (from the demo room button, and keyboard-only from `?tour=1` at 1280px), plus tour A twice for regressions. Every run passed, with no API calls and no console errors.

## Finesse pass on Priya's journey (owner's direction, the evening before the interview)

102. **The journey is now Benefits → Private Medical Insurance → Your cover → Review → back to Private Medical Insurance.** The benefits list and the PMI page mirror Navigator's own layout (filter chips, benefit cards, overview, included features, questions).
103. **On the PMI page, the space Navigator uses for "Plan information · Manage benefit" holds the flex prompt** ("Sam isn’t on your health cover", labelled as a flex benefit, with "Review my health cover"). Below it is a compact "Your cover from 1 April" card with "Adjust your cover". The prompt follows the plan: gap → changes to confirm → confirmed.
104. **The flex page moved to `/benefits/pmi/cover`.** Quick choices sit on top, then Who's covered and What's changed side by side, then Fine-tune, features and questions, with the cover panel (Review and confirm, Reset) on the right. Content is capped at 1180px so it no longer stretches.
105. **Fine-tune is now always open**, at the owner's request. This overrides CLAUDE.md §2.8 ("collapsed by default"). It's labelled "Optional" and sits below the quick choices, so the easiest path still comes first.
106. **"What your choices include" has an icon per feature**, a status dot in place of chips, and "Relevant to you" / "Changed" tags. Features not on the plan are greyed.
107. **Ask AI panel:** the composer is at the bottom, the question shows as a chat bubble, and "Continue in chat" sits in the header once there's a question. The panel follows the answer while it streams, then returns to the top. Opening the chat closes the panel, and pages and panels fade up softly (off with reduced motion).
108. **Home loses its search box** (the sidebar "Search or ask" remains). The benefit names, logos and copy stay fictional or text-only: the Navigator screenshots were used for layout only, per CLAUDE.md §3 and §16.
109. **Tour A follows the new path:** step 2 spotlights the prompt and cover card on the PMI page; steps 3–6 run on the cover page. After confirming, "Back to Private Medical Insurance" returns to where the journey started, now showing the confirmed state.
110. **Home's big "Action needed" card is now a small action chip under the greeting** ("1 action · Sam isn’t on your health cover · Closes in 9 days"), with a "1" badge on Benefits in the sidebar. It always leads to the PMI page, which explains the gap in full. It changes to "Finish adding Sam…" for a draft, and to a quiet "Your health cover is confirmed for 1 April" once confirmed. "Remind me tomorrow" and "Also for you" are gone with the card.
111. **The comparison now comes before choosing.** It always includes the lean way to add Sam ("Suggested in chat" when the AI proposed it), highlighted by default. "Your choices so far" appears as a fourth column when the plan on screen isn't one of the other three (e.g. Sam added with nothing else changed, at £80.00). Choosing the suggested plan there counts as accepting the chat proposal, so the chat card agrees.
112. **Tour A is 12 steps:** … proposal (9) → compare plans (10) → choose lean and review the payslip (11) → confirm (12). Finish takes Priya back to the PMI page, now showing "You and Sam are covered from 1 April".
113. **The confirmed state is a sheet that slides in from the right over a blurred review page**, not a separate page. It's a modal dialog: focus starts on its heading and stays inside, and Esc, the close button or "Back to Private Medical Insurance" all return to the PMI page. Undo closes it and reopens the form. The tour waits for the slide-in to finish before placing its spotlight.
