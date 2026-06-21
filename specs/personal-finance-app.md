# Spec — Personal finance app (local core)

- **Slug:** `personal-finance-app`
- **Source:** [seeds/03-oversized.md](../seeds/03-oversized.md)
- **Phase:** `/specify` · **Date:** 2026-06-21
- **Revised:** 2026-06-21 — cut to the local, single-user, single-currency core after
  `/plan` failed the constitution gate on the network / multi-currency features. The
  cut features are recorded under Non-goals as deferred future specs (the split).

## Problem & why

The user wants one local place to record what they earn and spend, keep it
organized by category and on-budget, fix mistakes, and review it — without it
becoming a chore.

## Users / actors

- **Primary:** the user managing their own finances on one machine.

## User stories

- **US-1 (must):** record expenses and income quickly.
- **US-2 (must):** fix the record — edit or remove a past entry.
- **US-3 (must):** organize by category and stay on a monthly budget.
- **US-4 (should):** not re-type fixed bills every month.
- **US-5 (should):** review totals and export them.

## Functional requirements

- **FR-1:** Record an expense (amount, date, description, category).
- **FR-2:** Record income (amount, date, description, source).
- **FR-3:** Edit a past entry.
- **FR-4:** Delete a past entry.
- **FR-5:** Define and manage categories.
- **FR-6:** Set a monthly budget per category and warn when spending nears it.
- **FR-7:** Track recurring entries and add them on schedule.
- **FR-8:** Produce totals per category and period, and export them to a local file.

## Acceptance criteria

- **AC-1 (FR-1/2):** Given valid input (positive amount, date, description), when the
  user confirms, the entry appears in the list.
- **AC-2 (FR-1):** Given a zero or negative amount, when the user confirms, it is
  rejected and nothing is recorded.
- **AC-3 (FR-3):** Given a past entry, when the user edits a field and confirms, the
  list shows the new value.
- **AC-4 (FR-4):** Given a past entry, when the user deletes it, it no longer appears
  in the list. *(How the system treats the removed record — see Decisions.)*
- **AC-5 (FR-6):** Given a category budget, when month-to-date spending crosses the
  warn threshold, a warning is shown.
- **AC-6 (FR-7):** Given a recurring entry, when its scheduled date arrives, a
  matching entry is created once.
- **AC-7 (FR-8):** Given recorded entries, when the user runs a report for a period,
  per-category totals are produced and can be written to a file.

## Edge cases & error behavior

- Empty dataset; zero / negative / huge amounts; editing or deleting an entry that
  doesn't exist; a recurring entry whose date is in the past on first run;
  duplicate recurring creation; report over an empty period.

## Non-goals / out of scope

- **Deferred to future specs (cut at the gate):** multiple currencies + live rates
  (Art. III / I), bank import (Art. I), shared / multi-user account + cross-device
  sync (Art. I), receipt-photo reading (deferred to keep this core small).
- Investments, loans, forecasting, charts.

## Decisions & assumptions

| Question | Decision | Basis |
|---|---|---|
| Currency | single currency | constitution (Art. III) |
| Network features (FX, bank import, sharing, sync) | dropped from this spec, deferred to future specs | constitution (Art. I) |
| Categories (FR-5) | user-defined | ⚠ assumed |
| Recurring schedules (FR-7) | weekly / monthly / yearly | ⚠ assumed |
| Report shape (FR-8) | per-category totals per period; export to a local file | ⚠ assumed |
| **Delete / edit semantics (FR-3, FR-4)** | **⚠ open tradeoff** — does removing/changing a past entry erase it, or leave a trace? Art. V (nothing silently lost) pulls toward a trace; Art. VI (the user owns and can remove their data) pulls toward erasure. To be argued in `/plan`. | ⚠ open tradeoff |

_No `[NEEDS CLARIFICATION]` markers remain. The single ⚠ open tradeoff (FR-3/FR-4)
is left explicitly for `/plan` to adjudicate, not silently resolved._
