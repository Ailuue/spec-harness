# Spec Harness

A tiny learning lab for the **specify → plan → tasks → analyze** workflow. The
worked example is a *deliberately tiny* expense tracker. Three "seed" requests
are instrumented to expose where the workflow gets clunky — because feeling the
clunkiness is how you learn why the structure earns its keep.

> **The deliverable is [`runs/LOG.md`](runs/LOG.md)** — the friction journal.
> Not the code. There is intentionally no `/implement` step here.

## Layout

| Path | What it is |
|------|------------|
| [`constitution.md`](constitution.md) | Standing, always-binding rules. Every phase honors them; `/plan` gates on them. |
| [`CLAUDE.md`](CLAUDE.md) | Makes the constitution always-loaded context. |
| `.claude/commands/` | The four phase commands: `/specify`, `/plan`, `/tasks`, `/analyze`. |
| `.claude/agents/validator.md` | Adversarial reviewer subagent; reviews work it didn't write. |
| `seeds/` | Three instrumented requests (vague, contradictory, oversized). |
| `specs/` `plans/` `tasks/` | Generated artifacts land here, one `<slug>.md` per run. |
| `runs/LOG.md` | The friction journal — the actual deliverable. |
| `src/` | Where an implementation *would* go. Out of scope for this harness. |

## The pipeline

1. **`/specify <seed>`** — interview the request into an *implementation-free*
   spec. Unknowns become `[NEEDS CLARIFICATION]`, not guesses.
2. **`/plan <spec>`** — translate to a technical plan, but only after the
   **Constitution Check** gate passes. Conflicts halt the run.
3. **`/tasks <plan>`** — decompose into small, test-first, traceable tasks. An
   exploding list is a signal the spec was too big.
4. **`/analyze <slug>`** — a harsh, independent cross-check of all artifacts.
   Reports findings; fixes nothing.

Phases are sequential and gated. A later phase can send work back; it never
papers over a gap.

## Try it (suggested order)

- `/specify seeds/01-vague.md` → watch the open questions pile up.
- `/specify seeds/02-contradiction.md` then `/plan <its slug>` → watch the gate
  **fail** on Article I *before* any design happens.
- `/specify seeds/03-oversized.md` → `/plan` → `/tasks` → `/analyze` → watch the
  scope force decomposition, `/analyze` catch the buried network (Art. I) and
  multi-currency (Art. III) violations, *and* adjudicate the Art. V vs. Art. VI
  tension in an editable / deletable shared ledger — judgment, not lookup.

After each run, read [`runs/LOG.md`](runs/LOG.md) and answer its reflection
prompts. That reflection is the actual learning.
