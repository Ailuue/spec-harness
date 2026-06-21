---
description: Turn a raw request (or seed file) into an implementation-free spec.
argument-hint: <path to a seed file, or a one-line feature description>
---

You are running the **/specify** phase. Your only output is a spec: *what* and
*why*, never *how*.

## Before anything

1. Read `constitution.md`. You are bound by it.
2. Read the input: `$ARGUMENTS`. If it is a path, read that file and treat its
   "request" as the input (ignore any instrumentation notes meant for the human).
   Otherwise treat the text itself as the request.

## Hard rules (the phase boundary)

- **No implementation.** No languages, libraries, file formats, schemas, function
  names, algorithms, or architecture. If you catch yourself writing "how," delete
  it. A genuine constraint the user *requires* is recorded as an outcome in a
  "Constraints" list, not as a design.
- **Do not invent unknowns.** Where the request is silent or ambiguous, either ask
  the user, or record the gap inline as
  `[NEEDS CLARIFICATION: <the specific question>]`. A spec full of confident
  guesses is the failure mode this phase exists to prevent.
- **Record every resolution; never launder a guess.** The moment you resolve an
  ambiguity — because the user answered, because you applied a sensible default, or
  because the constitution settles it — write it into **Decisions & assumptions**
  (below). Do **not** let the resolution dissolve into confident prose. The
  reviewer in `/analyze` sees only the spec/plan/tasks — never this conversation,
  never `runs/LOG.md` — so a decision you don't record is one that reviewer cannot
  audit, and a clean review can just mean your guesses got laundered into fact
  before anyone checked them.
- **Every requirement must be testable.** If you cannot state how you would observe
  it passing, rewrite it until you can. Ban vague words (fast, simple, secure,
  intuitive) unless attached to a measurable criterion.

## Interview

If the request is underspecified, ask the user the smallest set of questions that
would unblock a correct spec (scope; the few must-have behaviors; what is
explicitly *not* wanted; edge cases like empty / negative / duplicate). Prefer
asking over guessing. You may proceed with `[NEEDS CLARIFICATION]` markers if the
user is unavailable, but never silently fill them — an unanswered question stays in
Open questions; an answered one moves to Decisions & assumptions.

## Write the spec

Create `specs/<slug>.md` (slug = short kebab name from the request). Include:

- **Problem & why** — the user's actual goal in one short paragraph.
- **Users / actors** — who uses this.
- **User stories** — "As a …, I want …, so that …", a handful, prioritized.
- **Functional requirements** — numbered `FR-1, FR-2, …`, each observable and
  testable, each tied to a story.
- **Acceptance criteria** — per requirement, in Given / When / Then form.
- **Edge cases & error behavior** — empty data, invalid / negative / huge amounts,
  duplicates, deleting things that don't exist, etc.
- **Non-goals / out of scope** — explicitly list what you are NOT doing. This is
  load-bearing; it is how the next phases stay small.
- **Decisions & assumptions** — a table of every ambiguity you resolved:
  `Question | Decision | Basis`, where Basis is one of `user-confirmed`,
  `assumed-default`, or `constitution (Art. N)`. Mark anything you decided
  *without* the user confirming it as **⚠ assumed**. If applying the constitution
  needs a judgment call (an article whose application is arguable, or two articles
  that pull apart), record it as an **⚠ open tradeoff** for `/plan` to argue — do
  not quietly pick a side. A resolved `[NEEDS CLARIFICATION]` lands here; it does
  not just vanish from the spec.
- **Open questions** — every unresolved `[NEEDS CLARIFICATION]`, collected.

## Finish

Append an entry to `runs/LOG.md` (process / friction notes) — but remember the LOG
is *not* seen by `/analyze`; the durable, auditable record of your judgment is the
Decisions & assumptions section in the spec itself. Note the phase `/specify`, the
slug, how many `[NEEDS CLARIFICATION]` markers remain, and any friction.

Then tell the user: the spec path, the count of open questions, and that the next
step is `/plan` — which will refuse to run while open questions remain.
