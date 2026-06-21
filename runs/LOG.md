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

### 2026-06-21 · /analyze · personal-finance-app
- **Result:** PASS-WITH-RISKS — 0 Critical, 3 High, 2 Medium, 1 Low. Traceability clean; trimmed core has no constitution violations.
- **Friction:** the findings that mattered weren't lookups — they came from *scrutinizing the plan's tension resolution*. The edit path only half-honors Art. V, and the audit-trace invented to satisfy Art. V is unspec'd behavior (Art. X). Adjudicating beat grepping.
- **What the structure caught:** two things every earlier phase missed — (1) the plan's own tradeoff fix introduced user-visible behavior that never went back into the spec (Art. X), and (2) "nears" is untestable. Re-deriving expected decisions also surfaced undecided interactions no one had recorded.
- **Sent back to:** /specify (audit-trace as a requirement; edit value-history decision; warn threshold; split Phases 2–4).

### 2026-06-21 · /tasks · personal-finance-app
- **Result:** 15 tasks across 6 areas; flagged **oversized** → 4 phases, recommend splitting Phases 2–4 into their own specs. 1 task (T-11 budget warning) blocked on a spec gap. 0 orphans, 0 uncovered FRs.
- **Friction:** even the *trimmed* core won't fit one increment — the real size only became undeniable here, when every FR exploded into tests. T-11 couldn't be made testable because the spec's "nears" has no number.
- **What the structure caught:** decomposition surfaced the true size late (as predicted) and turned "oversized" into a concrete phasing plan; tracing tests→FRs also exposed an undecided edit/delete ↔ budget/report interaction the plan never addressed.
- **Sent back to:** /specify (define the warn threshold; decide the delete/edit ↔ recompute interaction).

### 2026-06-21 · /plan · personal-finance-app (attempt 2)
- **Result:** GATE PASSED — 0 conflicts; the lone TENSION (FR-3/FR-4 edit/delete, Art. V vs VI) argued and resolved (erase payload, keep a minimal audit trace). Plan written.
- **Friction:** the tension had no clean winner — pure hard-delete breaks Art. V, full history breaks Art. VI. Had to *design* a synthesis (trace-without-payload) and flag a residual gap (edit doesn't retain prior values).
- **What the structure caught:** the TENSION verdict stopped me from silently defaulting to hard-delete; it forced an argued tradeoff onto the record and made me name the residual risk for `/analyze` to scrutinize.
- **Sent back to:** none — proceed to `/tasks`.

### 2026-06-21 · /specify · personal-finance-app (revision)
- **Result:** cut from 10 FRs to 8, all local / single-user / single-currency; deferred features recorded as future specs; 0 open questions, 1 ⚠ open tradeoff (edit/delete).
- **Friction:** the cut *was* the work — deciding what survives Art. I/III is a product call, and recording the dropped features as deferred specs (rather than deleting them) is what turns "gate failure" into a decomposition plan.
- **What the structure caught:** the split happened *here*, in the spec's Non-goals as an explicit list of future specs — not as silent scope-dropping. The buildable core is now plan-able while the illegal/large parts are parked, traceably.
- **Sent back to:** none

### 2026-06-21 · /plan · personal-finance-app (attempt 1)
- **Result:** CONSTITUTION GATE FAILED — 4 CONFLICTs (FR-3 multi-currency+live FX, FR-5 bank import, FR-8 shared/synced account, FR-10 cross-device sync) vs Art. I (no network) and Art. III (one currency). FR-8 edit/delete is a TENSION (Art. V vs VI), noted but moot while the gate fails. No plan written.
- **Friction:** not one buried landmine but a minefield — 4 of 10 FRs are network/multi-currency. This isn't a spec to plan; it's several specs, most of which the constitution forbids outright.
- **What the structure caught:** clause-level citation made it precise — FR-3 trips *two* clauses (Art. III currency + Art. I network), which the old folded article would have blurred into one "Article II." And the gate refused to let the lone buildable core get designed while illegal scope rode along.
- **Sent back to:** /specify — cut to a local, single-user, single-currency core; split/defer the rest.

### 2026-06-21 · /specify · personal-finance-app
- **Result:** spec written; 10 FRs, 0 open questions — but **7 ⚠ assumptions** and 1 ⚠ open tradeoff recorded.
- **Friction:** the request was so broad that staying implementation-free was easy, but pinning it to *testable* requirements meant assuming a default for nearly every feature — seven resolutions just to make it plan-ready.
- **What the structure caught:** the Decisions & assumptions section turned the vagueness into something countable — 7 assumptions is a quantified scope smell a one-shot prompt would have buried — and it forced the edit/delete question into the open as a tradeoff instead of letting me silently pick hard-delete.
- **Sent back to:** none (yet)

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
