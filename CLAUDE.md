# Spec Harness — always-loaded context

This repo is a *learning harness*. The goal is to feel **why** the
specify → plan → tasks → analyze sequence is useful, by running it on a
deliberately tiny expense tracker and recording where it gets clunky.

## Binding rule

[`constitution.md`](constitution.md) is **binding** for every phase and every
agent in this repo. Read it before acting. If a request conflicts with it, you
do not "work around" it — you stop and surface the conflict (see `/plan`).

## The pipeline (run in order, do not skip)

1. `/specify <seed>` → an implementation-free `spec.md` in `specs/`
2. `/plan <spec>`    → a `plan.md` in `plans/` — **only if the constitution gate passes**
3. `/tasks <plan>`   → small, verifiable `tasks.md` in `tasks/`
4. `/analyze <slug>` → adversarial cross-check of all artifacts

Each phase has a hard boundary. A later phase may **send work back** to an
earlier one; it may not silently paper over a gap.

## The deliverable

The point is not the expense tracker. The deliverable is
[`runs/LOG.md`](runs/LOG.md) — the friction journal. Every command appends an
entry. Read it at the end and ask: *which clunkiness did the structure expose
that a single "just build it" prompt would have hidden?*

Implementation (`src/`) is intentionally **out of scope** here — this harness is
about the upstream discipline, not the code generation.
