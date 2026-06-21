# tools/ — harness tooling (not the expense tracker)

> **Why this exists, and why it isn't a constitution violation.**
> [`../src`](../src) is deliberately empty: the expense-tracker *implementation*
> is out of scope for this harness. This package is **not** that. It's
> infrastructure that enforces the upstream discipline mechanically instead of by
> prose — exactly the move the repo's own [LEARNINGS](../LEARNINGS.md) entry
> *"Enforce a constraint with tooling, not with instructions"* argues for. The
> command files currently *describe* the shape each artifact must have and *ask*
> the reviewer to build a traceability matrix by hand. Here we make the shape a
> schema (it parses or it doesn't) and the matrix a graph (deterministic, cheap).

## What's here

| File | Role |
|---|---|
| [`src/md.ts`](src/md.ts) | Thin markdown→AST layer (remark + gfm). Lifts sections, tables, and lists out of the tree instead of regexing headings. |
| [`src/schema.ts`](src/schema.ts) | Zod schemas for the *implicit* structure of each artifact: numbered `FR-n`, the `Decisions & assumptions` table with a constrained `Basis`, the plan's `Constitution Check` verdict vocabulary + `Requirement → design map`, tasks that each trace to an FR. |
| [`src/parse.ts`](src/parse.ts) | Glue: AST → typed objects, validated by the schemas. Returns findings (structure / schema / drift) instead of throwing. |
| [`src/trace.ts`](src/trace.ts) | The traceability checker + CLI: builds the FR→plan→task graph, prints the matrix, and emits gate + advisory violations. |
| [`test/trace.test.ts`](test/trace.test.ts) | The deterministic logic is the whole value, so it's tested (Art. VII in spirit). |

## Install & run

```sh
cd tools
npm install
npm test            # node:test via tsx
npm run typecheck

# run the checker against an artifact set (specs/plans/tasks <slug>.md):
npm run trace -- personal-finance-app          # human-readable matrix
npm run trace -- personal-finance-app --json   # machine-readable report
```

Exit code is **1** when there is any *gate* violation, **0** otherwise.

## What gates vs. what's advisory

This split is the point. trace.ts does the mechanical bookkeeping so the
`/analyze` LLM reviewer spends its budget on judgment (adjudicating the Art. V vs
VI tension, catching a laundered audit-trace) — not on graph reachability, which
a model gets subtly wrong under load.

**GATE** (non-zero exit; meant to fire *before* the reviewer runs):

- `DROPPED_FR` — an FR with no element in the plan's Requirement → design map.
- `UNCOVERED_FR` — an FR that's in the plan but no task traces to it.
- `UNRESOLVED_MARKER` — a `[NEEDS CLARIFICATION: …]` marker or a non-empty Open
  questions section still in the spec.
- `BLOCKED_TASK` — a task marked blocked (an unresolved gap pointing upstream).
- `MALFORMED_ARTIFACT` — a structural/schema failure: the artifact can't be
  trusted, so the graph can't either.

**ADVISORY** (exit 0; context handed to the reviewer, not a stop):

- `ORPHAN_TASK` — a task tracing to an unknown FR, or to none (possible scope creep).
- `INFRA_ONLY_FR` — an FR touched only by `infra`/`all FRs` tasks, no FR-specific
  task. Usually fine; worth a glance.
- `DRIFT` — a value that parses but deviates from the documented spelling (e.g.
  `⚠ assumed` where specify.md says `assumed-default`).

## How it slots into the pipeline

`/analyze` runs this gate first. If it fails, the run stops and points back to the
phase each finding names — *before* delegating the judgment audit to the
`validator` subagent. The reviewer never burns budget on an artifact set with a
mechanical hole in it. trace.ts does **not** replace `/analyze`; it clears the
deterministic checks off the reviewer's plate.
