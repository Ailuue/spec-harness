# Friction Journal (runs/LOG.md)

**This file is the deliverable.** The expense tracker is just the excuse. The
point of the harness is to make the clunkiness of turning a wish into working
software *visible*, and to notice which clunkiness the
specify → plan → tasks → analyze structure exposed that a single "just build it"
prompt would have hidden.

Every command appends one entry here. Read top to bottom after a run.

## Entry format

Append entries newest-on-top, one per command, like this:

```
### <date> · <phase> · <slug>
- **Result:** <e.g. spec written / GATE FAILED on Art. I / 31 tasks, flagged oversized / FAIL: 2 Critical>
- **Friction:** <what was clunky — what you had to ask, guess, defer, or send back>
- **What the structure caught:** <the thing this phase surfaced that a one-shot prompt would have missed>
- **Sent back to:** <none | /specify | /plan | /tasks>
```

## Reflection prompts (fill in after running the seeds)

- Where did separating "what" from "how" actually pay off?
- What did the constitution gate stop *before* it became code?
- Which seed forced decomposition, and how late did that become obvious?
- What did `/analyze` find that every earlier phase missed?
- For which seed was the full ceremony overkill — and how do you know?

---

<!-- entries below (newest first) -->

### 2026-06-21 · /plan · expense-tracker-synced (attempt 2)
- **Result:** CONSTITUTION GATE FAILED at Gate 2 — FR-2 (auto-email) and FR-3 (cloud sync) conflict with Article I (local-first, no network). 2 of 5 FRs, 2 of 3 must-have stories. No plan written; `plans/` stays empty.
- **Friction:** the request cannot be built as asked without changing the project's rules — and that was knowable from the spec alone, with zero design done.
- **What the structure caught:** the contradiction surfaced *at the planning boundary, before any architecture or code*. A single "just build it" prompt would have happily started wiring an email + cloud-sync feature that violates the constitution, and the conflict would only have shown up as rework later.
- **Sent back to:** /specify (drop FR-2/FR-3) **or** amend constitution.md (with justification)

### 2026-06-21 · /specify · expense-tracker-synced (revision)
- **Result:** clarifications resolved via interview; 0 open questions remain.
- **Friction:** answering was quick once asked — the cost was that they had to be asked at all before the contradiction could even be examined.
- **What the structure caught:** resolving the vagueness is what *unblocks* the more important check; an unclarified spec would have stalled at Gate 1 indefinitely, never reaching the constitution gate.
- **Sent back to:** none

### 2026-06-21 · /plan · expense-tracker-synced (attempt 1)
- **Result:** HALTED at Gate 1 (spec readiness) — 3 unresolved `[NEEDS CLARIFICATION]`. No plan written; never reached the constitution gate.
- **Friction:** the *first* thing `/plan` blocked on wasn't the contradiction — it was unrelated vagueness (expense fields, edit/delete, validation). The interesting conflict stayed hidden behind the open questions.
- **What the structure caught:** you cannot plan around unknowns; the gate refused to proceed and bounced the work back to `/specify` before any design happened. But it also revealed an ordering quirk — see the LEARNINGS entry.
- **Sent back to:** /specify

### 2026-06-21 · /specify · expense-tracker-synced
- **Result:** spec written; 3 open questions (`[NEEDS CLARIFICATION]` markers).
- **Friction:** the seed *reads* specific but underspecifies what an "expense" even is (no fields), and "always match" hides offline-conflict behavior. Had to record the user's wishes faithfully without judging them — including the email/sync asks, which feel wrong here but are legitimately "what," not "how."
- **What the structure caught:** the implementation-free rule forced me to leave the email/sync requirements in as plain requirements rather than quietly designing them or rejecting them on the spot — deferring the conflict to the gate instead of hiding it.
- **Sent back to:** none (yet)
