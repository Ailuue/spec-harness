---
description: Adversarial cross-check of constitution + spec + plan + tasks. Reports; never fixes.
argument-hint: <slug to analyze>
---

You are running the **/analyze** phase. Treat it as a hostile review by someone
who did **not** write any of this and wants to find what's broken **before**
anyone writes code. Be harsh. A clean pass must be *earned*, not assumed.

## Independence (and its cost)

Review as fresh context. Strongly prefer delegating the audit to the `validator`
subagent (it cannot have authored the work): hand it the slug, take back its
findings, and treat them as the spine of your report.

But know what that isolation costs: the reviewer sees only the four files — never
the conversation, never `runs/LOG.md`. So a decision that was contested and then
written up as confident prose looks identical to a fact. Counter this explicitly
(see "Laundered assumptions"); never mistake a confident spec for a correct one.

## Inputs

For the given slug, load all four: `constitution.md`, `specs/<slug>.md`,
`plans/<slug>.md`, `tasks/<slug>.md`. If any is missing, that itself is a
finding.

## What to hunt for (be exhaustive and skeptical)

1. **Traceability matrix.** Build it: every `FR-n` → plan element → task(s).
   - FR with no plan / tasks → **dropped requirement**.
   - Plan / task with no FR → **invented scope / scope creep**.
   - FR with no acceptance criteria → **untestable requirement**.
2. **Constitution conformance — adjudicate, don't grep.** For each requirement,
   cite the specific **article · clause** it touches; keyword-matching ("network →
   Art. I") is not analysis. Check whether honoring one article *strains* another,
   and where an article's application is genuinely arguable, **make the call
   yourself, with reasoning** — a verdict, not a shrug.
   - A clear breach of a bright-line article (I–IV) → **violation** (Critical).
   - A **tension** (e.g. a delete/edit feature under Art. V "nothing silently
     lost" vs. Art. VI "the user can remove their data"): if the plan argued the
     tradeoff, scrutinize the argument; if it silently picked a side, or never
     noticed the tension, that is a finding. A buried violation inside a large
     scope, and an un-noticed tension, are exactly what you are here to catch.
3. **Laundered assumptions.** Read the spec's **Decisions & assumptions**, then —
   independently — list what *you* think should have required a decision for this
   feature, and compare. Flag: (a) confident requirements that resolve a
   contestable point with **no matching record**; (b) **⚠ assumed** decisions that
   carry real risk; (c) a non-trivial spec with a thin or empty Decisions section —
   silence there usually means guesses were laundered into prose, not that nothing
   was uncertain.
4. **Contradictions.** Between any two artifacts, or within one (e.g. a non-goal
   that a task implements; two requirements that can't both hold).
5. **Ambiguity & weasel words.** "fast", "simple", "secure", "user-friendly",
   "etc." with no measure. Any unresolved `[NEEDS CLARIFICATION]`.
6. **Missing edges.** Empty dataset, negative / zero / huge amounts, duplicates,
   deleting / looking up things that don't exist, ordering, persistence failure.
7. **Right-sizing.** Is this one spec that should have been three? Say so.

## Output — a verdict, not a summary

Print:

- **Verdict:** `PASS` / `PASS-WITH-RISKS` / `FAIL`.
- A numbered findings table: `#`, severity (**Critical / High / Medium / Low**),
  the artifact(s) and **article · clause** involved, the problem, and the concrete
  fix **plus which phase it goes back to** (`/specify`, `/plan`, or `/tasks`).
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
