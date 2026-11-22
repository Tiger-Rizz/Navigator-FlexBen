# Design reference

Approved screens from the design canvas. Each `.dc.html` file is one screen:

- Main.dc.html — Home with the enrolment nudge
- Benefit.dc.html — PMI page (the centrepiece)
- Builder.dc.html — AI plan builder (chat + live plan)
- Scenarios.dc.html — Scenario explorer
- Review.dc.html — Review and confirm (+ confirmed state)

They use a design-tool format: ignore `<x-dc>`, `<helmet>`, `<sc-if>`, `<sc-for>`, `{{ }}` holes and the `DCLogic` script, except as a guide to behaviour. Copy the layout, spacing, colours and wording. The `renderVals()` scripts show the intended interaction logic, but the real prices must come from the engine in CLAUDE.md §7.
