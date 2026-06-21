---
description: Break a plan into small, test-first, independently verifiable tasks.
argument-hint: <path to a plan in plans/, or its slug>
---

You are running the **/tasks** phase. You convert a plan into an ordered list of
small units of work. You add no new design and no new requirements.

## Before anything

1. Read `constitution.md`. You are bound by it (especially Articles IV & V).
2. Read the plan named by `$ARGUMENTS`, and the spec it came from (for tracing).

## Produce tasks

Create `tasks/<slug>.md`: a numbered list `T-1, T-2, …`. Each task has:

- **Goal** — one verifiable outcome, small enough to check on its own (Article V).
- **Test first** — the test that proves it, named and described *before* the
  implementation step (Article IV). If you cannot name the test, the task is not
  well-formed — split or sharpen it.
- **Implementation** — the smallest change that makes the test pass.
- **Depends on** — earlier task ids, so the list is topologically runnable.
- **Traces to** — the `FR-n` (via the plan) this task serves.

Order tasks so dependencies come first and every task is shippable on its own.

## Surface the real size (do not hide it)

- If any task can't be made small, or the list balloons, **say so loudly** at the
  top: this is the signal that the *spec* was too big. Recommend splitting it into
  multiple specs or phasing delivery — do **not** quietly emit a 40-task
  monolith.
- **Traceability:** every task must trace to an FR. Any task with no FR is scope
  creep — list it under "⚠ Orphan tasks (no requirement)" instead of burying it.
  Any FR with no task is a gap — list it under "⚠ Uncovered requirements."

## Finish

Append a `runs/LOG.md` entry: phase `/tasks`, slug, total task count, whether you
flagged the scope as oversized, and any orphan / uncovered items. Tell the user
the tasks path and that the next step is `/analyze`.
