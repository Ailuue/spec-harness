---
description: Adversarial cross-check of constitution + spec + plan + tasks. Reports; never fixes.
argument-hint: <slug to analyze>
---

You are running the **/analyze** phase. Treat it as a hostile review by someone
who did **not** write any of this and wants to find what's broken **before**
anyone writes code. Be harsh. A clean pass must be *earned*, not assumed.

## Independence

Review as fresh context. Strongly prefer delegating the audit to the `validator`
subagent (it cannot have authored the work): hand it the slug, take back its
findings, and treat them as the spine of your report. If you author and review in
the same breath, you will miss your own gaps — that is the whole reason this phase
is separate.

## Inputs

For the given slug, load all four: `constitution.md`, `specs/<slug>.md`,
`plans/<slug>.md`, `tasks/<slug>.md`. If any is missing, that itself is a
finding.

## What to hunt for (be exhaustive and skeptical)

1. **Traceability matrix.** Build it: every `FR-n` → plan element → task(s).
   - FR with no plan / tasks → **dropped requirement**.
   - Plan / task with no FR → **invented scope / scope creep**.
   - FR with no acceptance criteria → **untestable requirement**.
2. **Constitution conformance.** Re-check *every* artifact against *every* article
   independently — assume the `/plan` gate missed something. A violation buried
   inside a large scope is exactly what you are here to catch.
3. **Contradictions.** Between any two artifacts, or within one (e.g. a non-goal
   that a task implements; two requirements that can't both hold).
4. **Ambiguity & weasel words.** "fast", "simple", "secure", "user-friendly",
   "etc." with no measure. Any unresolved `[NEEDS CLARIFICATION]`.
5. **Missing edges.** Empty dataset, negative / zero / huge amounts, duplicates,
   deleting / looking up things that don't exist, ordering, persistence failure.
6. **Right-sizing.** Is this one spec that should have been three? Say so.

## Output — a verdict, not a summary

Print:

- **Verdict:** `PASS` / `PASS-WITH-RISKS` / `FAIL`.
- A numbered findings table: `#`, severity (**Critical / High / Medium / Low**),
  the artifact(s) involved, the problem, and the concrete fix **plus which phase
  it goes back to** (`/specify`, `/plan`, or `/tasks`).
- Any **Critical** finding forces `FAIL` and blocks implementation.

Force yourself to look hard: if you report zero findings, you must justify, item by
item, why each hunt above came up empty. Silence is not a pass.

## Boundaries

`/analyze` **reports only**. It does **not** edit the spec, plan, or tasks.
Fixing means re-running the phase the finding points back to. Keeping the
reviewer's hands off the work is what keeps the review honest.

## Finish

Append a `runs/LOG.md` entry: phase `/analyze`, slug, the verdict, and the count
of findings by severity. Then summarize the top findings to the user and name the
phase(s) the work must return to.
