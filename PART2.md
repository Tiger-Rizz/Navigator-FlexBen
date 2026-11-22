# PART2.md - Demo room, notes and two Part 2 features

Read alongside CLAUDE.md, whose principles, tokens and copy rules all still apply. The approved designs are in `/design-reference`: `DemoRoom.dc.html`, `Notes.dc.html`, `Pay.dc.html`, `Claim.dc.html` (same design-tool format as before: ignore `<x-dc>`, `{{ }}` and `DCLogic`; copy layout, spacing and wording; use `renderVals()` only to understand behaviour).

**Time box: tonight.** Everything in Part 2 is scripted and deterministic: no API calls, no new engine work. Keep it tight and polished.

---

## 1. Information architecture

| Route | What |
|---|---|
| `/` | **Demo room** (new). No sidebar. The reviewers' starting point after the passcode. |
| `/home` | The existing Navigator Home (moved from `/`). Update every link, the sidebar Home item and tour A. |
| `/notes/flex` | Part 1 notes (content from §4; replaces `/about`, so make `/about` redirect here). |
| `/notes/pay` | Notes for "Your pay, explained". |
| `/notes/claim` | Notes for "Claim it". |
| `/pay` | Feature 1: Your pay, explained. |
| `/claims` | Feature 2: Claim it. |

- **Sidebar** (all Navigator pages): add a small "← Demo room" link above the brand tile, and two nav items after Benefits: **My pay** (`/pay`) and **Claims** (`/claims`), each with a small "New" badge (AI accent colours).
- **Notes pages** share one layout (`Notes.dc.html`): left column with the three notes as tabs/links (kicker + title, current one highlighted), right article card: kicker, title, a one-line thesis in a serif, [Take the guided tour], then sections. Each notes page links to its tour, and each tour's end card links back to its notes and the demo room.
- Persona for Part 2 is still Priya, later in the year. **The story: March enrolment (Part 1) → April payslip (Feature 1) → a claim in May (Feature 2).** Sam is covered from 1 April.

## 2. Demo room `/` (`DemoRoom.dc.html`)

Header: brand tile, "Navigator prototype · Euphoric Deployment Strategist take-home", **"Divin's demo room"**, intro line. Two sections:
- **Part 1 · The brief: "Flex benefits for UK PMI"**: description, four tags (cover levels, dependants, employer options, contribution trade-offs), [Take the guided tour · 3 min] → starts tour A, [Explore freely] → `/home`, "Read my notes" → `/notes/flex`; a brand-tint panel on the right previewing the "£51.50 a month" cover panel.
- **Part 2 · Beyond the brief: "Two features I'd add to Navigator"**: intro ("Both are for employees and both follow Priya after enrolment…"), two cards: *Your pay, explained* and *Claim it*, each with [Take the guided tour] and "Read my notes".
- Footer: fictional/illustrative disclaimer · "Built by Divin Kamath".
- Replace the old landing "Take the 3-minute guided tour" card on `/home` (the demo room does that job now), but keep `?tour=1` working.

## 3. Feature 1: Your pay, explained `/pay` (`Pay.dc.html`)

Static data in `/data/pay.april-2027.json`. Copy all wording from the design reference.
- Header: "April 2027 payslip · paid 30 April", "Your pay, explained", March / **April** month toggle (March shows a simple "Nothing changed in March" state).
- **AI summary card:** "Your take-home pay is up £29.35 on March, but not by as much as your pay rise. Four things changed." Source line. Stats: Pay rise before tax **+£180.00** · Change in take-home **+£29.35**.
- **What changed since March**: 4 expandable rows (one open at a time; the health cover row is open by default), each with an explanation, a linked benefit (small tile + underlined name) and a source line:

| Row | Take-home effect | Key explanation |
|---|---|---|
| Your pay rise (3% → £74,160 a year) | **+£104.40** | £180 more a month; after 40% tax + 2% NI, £104.40 reaches you |
| Cycle to work started (£83.33 a month for 12 months, before tax) | **−£48.33** | salary sacrifice; eleven more payments |
| Health cover is now taxed through payroll | **−£21.50** | from April 2027 tax is taken through payslips, not the tax code; "Medical benefit £116.67" is the value taxed, not money paid; higher because Sam joined; tax code back to 1257L. Links to `/benefits/pmi`. |
| Pension on your higher salary (still 5%) | **−£5.22** | £9 more a month, £5.22 after tax; Meridian's 8% grows too |

(Check: +104.40 − 48.33 − 21.50 − 5.22 = **+29.35**. Add a unit test for it.)
- **Lines that changed** (right column), March → April: Basic pay £6,000.00 → £6,180.00 · Pension (salary sacrifice) −£300.00 → −£309.00 · Cycle to work - → −£83.33 · Medical benefit (taxed, not paid to you) - → £116.67 · Health cover deduction - → −£4.83 · Tax code 1167L → 1257L. "View full payslip" link (can open a simple modal). "Ask about your pay" with two suggested questions ("Why did my tax code change?", "When do my bike payments end?"). These open the Ask AI panel with scripted answers:
  - Tax code: "Until April, the £900 value of your health cover was taken off your tax-free allowance, giving 1167L. Now that the tax is collected through payroll each month, the adjustment is gone and you're back on 1257L."
  - Bike: "Your last payment is in March 2028, the 12th month. After that, your take-home goes up by £48.33 a month."
- **Something look wrong?** [Ask payroll] → inline form: line select (required, inline error if empty), optional note, "We'll attach your April payslip, the line and this explanation." [Send to payroll] → confirmation "Sent to Meridian Payroll. They usually reply within 2 working days…"

## 4. Feature 2: Claim it `/claims` (`Claim.dc.html`)

Static data in `/data/claims.json`. Receipt "reading" is simulated: show a ~900ms "Reading your receipt…" shimmer, then the fields.
- **Start:** title "Claim it", "Add a receipt. Navigator works out which benefit pays, and claims it for you or gets it ready." Dashed upload area ("Snap or upload a receipt", "Or describe it, like 'new glasses, £189'", [Add a receipt]; a real file picker can accept an image but always maps to the glasses demo). "Try it with one of Priya's receipts": two sample cards. "Your recent claims": Gym membership £45.00 · Wellbeing Allowance · Paid 30 April; Eye test £25.00 · Wellbeing Allowance · Paid 31 March.
- **After picking:** receipt mock on the left (monospace), "Read from your receipt. Check it's right." with editable Provider / Date / What for / Amount, then the route:
- **Glasses: Clearview Opticians, 14 May 2027, £189.00 → Meridian Wellbeing Allowance** (fully in Navigator): "Glasses aren't covered by your AXA plan on Core, but eye care is on Meridian's allowance list. You have £430 left this year, so this fits." Facts: Allowance left after this **£241.00** · Paid with your salary **31 May** · In your pocket, after tax **£109.62** (189 × 0.58). Tax note + source. Required checkbox "This was for me, and I haven't claimed it anywhere else." (inline error) → [Submit claim · £189.00] → status: Submitted ✓ · Approved automatically ✓ (meets Meridian's allowance rules) · Paid with your salary (31 May, pending) + link "It'll show on your May payslip, explained in Your pay →" (`/pay`). Add to recent claims as "Approved".
- **Physio: Hackney Physio Clinic, 12 May 2027, £65.00 → AXA hand-off**: "Your AXA health cover handles this one… you chose a £250 excess, so AXA won't pay out on this £65 invoice. Claiming it still counts towards your excess, so a later claim this year costs you less." Tip: start through AXA's Muscles, Bones and Joints service next time. "Ready for AXA": Membership number MER 4417 2291 · Patient Priya Shah · Treatment Physiotherapy assessment, 12 May 2027 · Invoice Attached · £65.00. [Continue on AXA's site ↗] (opens a mock "You're leaving Meridian Benefits for AXA Health" interstitial, never a real external URL) + [Copy details] (copies to clipboard, toast "Copied") → status "Handed to AXA with your details filled in. We'll check in on 22 May…".
- [Start another claim] resets.
- Use the excess from Priya's Part 1 plan where possible (if the store selection has £0 excess, the physio copy should say AXA would pay it, minus nothing). Keep it simple: read the excess from the store, defaulting to £250.

## 5. Guided tours (reuse the TourProvider from tour A)

- **Tour P (Pay, 5 steps):** 1 summary card · 2 health cover row (payrolling from April 2027, Sam, tax code) · 3 cycle to work row (salary sacrifice maths) · 4 lines that changed · 5 Ask payroll → choose "Cycle to work" → send → confirmation. End card: [Read my notes] [Next: Claim it tour] [Back to demo room].
- **Tour C (Claims, 6 steps):** 1 start screen ("Nobody needs to know which benefit covers what") · 2 pick glasses → reading → fields to check · 3 the route + three facts + tax · 4 tick + submit → status → payslip link · 5 start another → physio → excess insight · 6 prepared hand-off → continue → status. End card: [Read my notes] [Back to demo room].
- Caption style as tour A: "Guided tour · Step x of n", a bold one-line **what's happening**, a short **why it matters**, Back / Next / Exit. Next performs the action. Deterministic, keyboard accessible.
- Entry: `/pay?tour=1`, `/claims?tour=1`, and the demo room buttons.

## 6. Notes content (paste verbatim from `Notes.dc.html` → `renderVals()` → `notes` array)

Three notes (Part 1, Pay, Claim it), each with a kicker, title, thesis and sections. Put the content in `/data/notes.json` so the author can edit it without touching components. **Keep the wording as written.**

## 7. Definition of done

`npm run build` and `npm test` pass (add tests for the pay arithmetic and the claim maths: 500 − 45 − 25 = 430; 430 − 189 = 241; 189 × 0.58 = 109.62). All three tours run end to end without an API key. Demo room → each tour → its notes → back to the demo room all work. No console errors. Matches the design reference at 1440 and 1280, and is usable at 390.
