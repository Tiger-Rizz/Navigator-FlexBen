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
