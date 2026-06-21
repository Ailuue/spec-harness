# Tasks — Personal finance app (local core)

- **Slug:** `personal-finance-app`
- **Plan:** [plans/personal-finance-app.md](../plans/personal-finance-app.md)
- **Phase:** `/tasks` · **Date:** 2026-06-21

> ⚠ **Oversized — recommend phasing/splitting.** Even after the gate cut the network
> features, the buildable core is **15 tasks across 6 capability areas** (ledger,
> edit/delete+audit, categories, budgets, recurring, reporting). That is more than one
> increment should carry. Ship **Phase 1** as the usable core; consider promoting
> Phases 2–4 into their own specs rather than one mega-spec.
>
> ⚠ **One task is blocked on a spec gap:** T-11 (budget warning) can't be made testable
> until the spec defines the warn threshold — "nears" (AC-5) has no number. Sent back to
> `/specify`.

## Phase 1 — core ledger

- **T-1 · store round-trip.** Goal: load/save the JSON dataset. Test: save then load
  returns identical data; missing file yields an empty dataset. Impl: `store`. Depends: —. Traces: infra (all FRs).
- **T-2 · money in minor units.** Goal: parse/format integer minor units, reject floats.
  Test: `"12.99"→1299`, `format(1299)="12.99"`, fractional cents rejected. Impl: `money`. Depends: —. Traces: FR-1, FR-2.
- **T-3 · add expense.** Test: a valid expense appears in the list (AC-1). Impl: `entries.add`. Depends: T-1,T-2. Traces: FR-1.
- **T-4 · reject bad amount.** Test: zero/negative rejected, nothing recorded (AC-2). Depends: T-3. Traces: FR-1, FR-2.
- **T-5 · add income.** Test: a valid income appears. Depends: T-3. Traces: FR-2.
- **T-6 · edit entry (+audit).** Test: edited field shows new value (AC-3) **and** an
  `{action:edited,...}` line is appended. Depends: T-3. Traces: FR-3.
- **T-7 · delete entry (+audit, no payload).** Test: entry gone from list (AC-4) **and**
  an `{action:deleted, entryId, ts}` line exists with **no amount/description retained**.
  Depends: T-3. Traces: FR-4.

## Phase 2 — organize & budget

- **T-8 · categories.** Test: define/list categories; entry rejects unknown category. Depends: T-1. Traces: FR-5.
- **T-9 · set budget.** Test: set a monthly limit per category; persists. Depends: T-8. Traces: FR-6.
- **T-10 · month-to-date total.** Test: MTD spend per category sums only that month's expenses. Depends: T-3,T-8. Traces: FR-6.
- **T-11 · budget warning.** ⚠ Test: warn when MTD ≥ threshold (AC-5) — **threshold undefined in spec**. Blocked. Depends: T-9,T-10. Traces: FR-6.

## Phase 3 — automation

- **T-12 · define recurring.** Test: create a recurring entry with a schedule. Depends: T-3. Traces: FR-7.
- **T-13 · materialize due recurring.** Test: on run, a due recurring creates exactly one
  entry (idempotent — second run same day adds none; AC-6). Depends: T-12. Traces: FR-7.

## Phase 4 — reporting

- **T-14 · report totals.** Test: per-category totals over a period; empty period → zeros (AC-7). Depends: T-3,T-8. Traces: FR-8.
- **T-15 · export report.** Test: report written to a **local** file; re-readable. Depends: T-14,T-1. Traces: FR-8.

## Traceability

- **Orphan tasks (no FR):** none.
- **Uncovered requirements:** none — FR-1…FR-8 all covered.
- **Undecided interaction (flag):** how deleting/editing an entry affects already-shown
  budget MTD and reports (recompute from current entries?) isn't stated in spec or plan.
