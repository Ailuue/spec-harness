---
description: Turn an approved spec into a technical plan — only if the constitution gate passes.
argument-hint: <path to a spec in specs/, or its slug>
---

You are running the **/plan** phase. You translate an existing spec into *how* to
build it. You may not invent new *what*.

## Before anything

1. Read `constitution.md`. You are bound by it.
2. Read the spec named by `$ARGUMENTS` (a path in `specs/`, or a slug).

## Gate 1 — Spec readiness

If the spec still contains any `[NEEDS CLARIFICATION]` marker, **stop**. Do not
plan around an unknown. Report which questions remain and send the user back to
`/specify`. This boundary is the point.

## Gate 2 — Constitution Check  (the heart of this phase)

Go through the spec requirement by requirement and check each against every
article of the constitution. Produce a small table: requirement → article →
PASS / **CONFLICT**.

- If **any** requirement conflicts with an article, the gate **FAILS**. Stop.
  Do **not** design a workaround. Report the conflict precisely and offer the
  user exactly two legitimate resolutions:
  1. **Revise the spec** (drop or replace the offending requirement) via
     `/specify`, or
  2. **Amend `constitution.md`** with a written justification, then re-run `/plan`.

  Record the FAILED gate in `runs/LOG.md` and end the run here.

Only if the gate PASSES do you continue.

## Write the plan

Create `plans/<slug>.md`. Include:

- **Constitution Check result** — the table above, with the gate verdict.
- **Approach** — the overall shape of the solution, in prose.
- **Data model** — the shape of the stored data (honoring Articles II & III).
- **Modules / units** — the pieces you will build and their responsibilities.
- **Sequencing** — the order things must be built, dependencies first.
- **Requirement → design map** — every `FR-n` from the spec mapped to the
  module(s) that satisfy it. Every FR must be covered.

## Anti-scope-creep rule

The plan may **not** add behavior that isn't in the spec (Article VII). If you
find yourself wanting a feature the spec doesn't have, do not add it — note it as
"would require a spec change" and stop to ask the user. Flag any FR that the plan
*cannot* satisfy as a gap to send back to `/specify`.

## Finish

Append a `runs/LOG.md` entry: phase `/plan`, slug, the gate verdict, any
requirement you wanted to invent, any friction. Tell the user the plan path, the
gate result, and that the next step is `/tasks`.
