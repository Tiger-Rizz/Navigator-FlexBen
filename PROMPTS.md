# Claude Code prompts, in order

Before you start, put `CLAUDE.md` in the repo root and unzip `design-reference.zip` into `/design-reference`. Run each prompt in order and commit after each one passes. If Claude Code drifts, remind it: "Re-read CLAUDE.md §X."

---

## Prompt 0 — Orient and plan (no code yet)

```
Read CLAUDE.md fully, then read every file in /design-reference (they're the approved screens; ignore their <x-dc> templating and {{ }} holes, they're a design-tool format).

Then, without writing code yet:
1. Summarise the product, the principles and the screens in 10 bullets so I can check you've understood.
2. List anything in CLAUDE.md that's ambiguous or contradicts the design reference, with your proposed resolution.
3. Propose the exact package list and versions you'll use.
4. Create DECISIONS.md with your resolutions.

Wait for my go-ahead before step 1 of the build order.
```

## Prompt 1 — Scaffold, tokens and shell

```
Build order step 1 from CLAUDE.md §15.
- Next.js App Router + TypeScript + Tailwind, with the design tokens from §10 as CSS variables and Tailwind theme values. Inter via next/font.
- The shell from §9: sidebar (Meridian Benefits tile, "Search or ask" box, nav: Home, Benefits, Store, Recognition, My choices, Total rewards, Saved, "100 to spend" pill, Priya Shah), main area, collapsing to a top bar under 900px.
- All routes from §5 with placeholder content; Store/Recognition/Total rewards/Saved show a tidy "Not part of this prototype" state.
- Base UI components: Button (primary/secondary), Chip, Segmented control, Card, Badge, all accessible.
Match Main.dc.html and Benefit.dc.html for spacing, type and colours. Run the dev server and fix any warnings. Commit.
```

## Prompt 2 — Data, types and engine (with tests)

```
Build order step 2. Create the /data JSON files and zod-validated types exactly as in CLAUDE.md §6 (take feature copy, option hints and plan-year differences from Benefit.dc.html). Implement lib/engine/pricing.ts and claims.ts exactly as in §7, and rules.ts for eligibility and windows.
Write Vitest tests for every row in the §7 table, the excess saving (£162/yr, £13.50/mo), every cell in the §8 scenario table including both totals rows, and the eligibility rules (parent not eligible, one partner only, child age limits).
All tests must pass. Show me the test output, then commit.
```

## Prompt 3 — The PMI page

```
Build order step 3: /benefits/pmi exactly as in CLAUDE.md §9 and Benefit.dc.html, wired to a Zustand store (persisted to sessionStorage) holding persona, selection, status (editing/kept/confirmed) and any pending proposal.
Everything must be live from the engine: the "Add · £X a month" cost difference, the cover panel, the Flex Fund bar and note, feature statuses and highlights, hints, the "Changed" chips and the change count. Include Keep my current cover (with the green confirmation + Undo), Add someone (all four relationship paths with validation), and Fine-tune collapsed by default.
Leave the Ask AI pill as a stub for now. Check keyboard navigation and focus states. Commit.
```

## Prompt 4 — Ask AI panel + AI endpoint + scripted fallback

```
Build order step 4.
- app/api/chat/route.ts with the Vercel AI SDK + Anthropic provider, the system prompt and every tool from CLAUDE.md §11 (zod schemas, all calling the engine/data — no numbers from the model), streaming, a rate limit and a message cap.
- lib/ai/scripted.ts: a deterministic fallback used when there's no API key, on errors, and during the tour. It runs the same tools locally and streams with a typewriter effect. Cover the 5 common questions and the canonical opening exchange in §11.
- The floating "Ask AI about this benefit" panel per §9 (styled like Navigator's search pop-up): suggested questions, a dark question pill, an answer with an optional result card, inline benefit links, a privacy note when health comes up, a source line, "Continue in Chat" (carries the conversation over).
- A "Demo mode" badge when running without a key.
Test it with and without ANTHROPIC_API_KEY set. Commit.
```

## Prompt 5 — AI plan builder (chat + live plan)

```
Build order step 5: /benefits/pmi/chat per CLAUDE.md §9 and Builder.dc.html. Member context card, chat thread, suggestion chips, ProposalCard rendered from the propose_plan_change tool result, the live plan with pending differences (purple, old values struck through), Accept/Undo updating the shared store, the premium split bar, real cost and the "worth knowing" note. The canonical exchange must produce exactly £51.50 vs £80.00 and the tax insight. Commit.
```

## Prompt 6 — Scenarios, review, My choices, Home

```
Build order steps 6–8 per CLAUDE.md §8–§9 and Scenarios.dc.html, Review.dc.html, Main.dc.html. Everything is computed from the store and the engine (no hard-coded numbers in components). Review validates Sam's DOB and the guidance checkbox with inline errors, shows the April 2027 payslip preview, and confirming sets status to confirmed, updates My choices and shows the confirmed state. Home has the hero AI input (it routes to chat) and the Action needed card. Commit after each page.
```

## Prompt 7 — Guided tour A

```
Build order step 9: the guided demo from CLAUDE.md §12, tour A (12 steps). Spotlight + caption card (step x of n, "What's happening", "Why it matters", Back/Next/Exit), Next performs each step's action, scripted AI only, keyboard support, reduced-motion support. Landing card "Take the 3-minute guided tour" and ?tour=1. Reset state at tour start. Run the whole tour three times in a row with no API key and fix anything flaky. Commit.
```

## Prompt 8 — Notes for reviewers, polish, deploy

```
Build order steps 10–11. Create /about with the sections in CLAUDE.md §9, with TODO(owner) placeholders for my own words. Then do a polish pass: compare every screen with /design-reference side by side and fix differences in spacing, copy and hierarchy; an accessibility pass (labels, focus order, contrast, aria on icon buttons); responsive check at 1440, 1280, 1024 and 390 px; remove console errors. Add noindex, the optional DEMO_PASSCODE middleware, and confirm `npm run build` and `npm test` pass. Give me a Vercel deployment checklist. Commit.
```

## Prompt 9 (optional) — Tom persona + tour B

```
Build order step 12: add data/personas/tom.json, a persona switcher in the user menu, and tour B from CLAUDE.md §12. Tom (20% tax) trades down or opts out; any money freed goes back to his Flex Fund with a simple reallocation choice (dental cash plan, pension top-up or cash, all illustrative); the AI warns about rejoining later. Add engine tests for Tom's numbers. Commit.
```

---

### Prompts for when things go wrong
- **Numbers look off:** "Show me the engine output for this selection and the test that covers it. Don't change the UI until the engine is right."
- **It looks generic:** "Open /design-reference/<file> and list every visual difference from the current page, then fix them."
- **The AI makes things up:** "Find where the model produced a number or option without a tool call and fix the prompt and tools so it can't."
- **The tour is flaky:** "Make the tour fully scripted and state-driven; no network calls, no timers longer than 400ms."
