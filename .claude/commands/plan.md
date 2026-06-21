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

Go through the spec **requirement by requirement** against the constitution.
Produce a table: `Requirement | Article · clause | Verdict | Note`. Cite the
specific article *and the clause within it* — not just "Article II," but which
rule (e.g. "Art. II — no float math" vs. "Art. III — one currency"). Each verdict
is one of:

- **PASS** — consistent with the article.
- **CONFLICT** — violates a bright-line rule (e.g. it needs the network → Art. I).
  **Any CONFLICT fails the gate.** Stop; do **not** design a workaround. Report it
  and offer the user exactly two legitimate resolutions:
  1. **Revise the spec** (drop or replace the offending requirement) via
     `/specify`, or
  2. **Amend `constitution.md`** with a written justification, then re-run `/plan`.

  Record the FAILED gate in `runs/LOG.md` and end the run here.
- **TENSION** — honoring one article strains another, or an article's application
  is genuinely arguable (e.g. a delete/edit feature under both Art. V "nothing
  silently lost" and Art. VI "the user can remove their data"). A tension does
  **not** auto-fail — but you may not silently pick a side either. **Argue the
  tradeoff** in the plan: state the options, choose one, and justify it against
  *both* articles. An un-argued tension may not pass; if you can't resolve it,
  send it back to `/specify` as an open product decision.

Also read the spec's **Decisions & assumptions**: if it resolved ambiguities but
recorded none, or left an **⚠ open tradeoff**, adjudicate that here rather than
inheriting a laundered guess.

Continue only if the gate has **no CONFLICTs and every TENSION is argued**.

## Write the plan

Create `plans/<slug>.md`. Include:

- **Constitution Check result** — the table above, the gate verdict, and the
  argued resolution of any TENSION.
- **Approach** — the overall shape of the solution, in prose.
- **Data model** — the shape of the stored data (honoring Articles II–IV: exact
  money, one currency, a plain durable file).
- **Modules / units** — the pieces you will build and their responsibilities.
- **Sequencing** — the order things must be built, dependencies first.
- **Requirement → design map** — every `FR-n` from the spec mapped to the
  module(s) that satisfy it. Every FR must be covered.

## Anti-scope-creep rule

The plan may **not** add behavior that isn't in the spec (Article X). If you find
yourself wanting a feature the spec doesn't have, do not add it — note it as
"would require a spec change" and stop to ask the user. Flag any FR that the plan
*cannot* satisfy as a gap to send back to `/specify`.

## Finish

Append a `runs/LOG.md` entry: phase `/plan`, slug, the gate verdict (incl. any
TENSION you argued), any requirement you wanted to invent, any friction. Tell the
user the plan path, the gate result, and that the next step is `/tasks`.
