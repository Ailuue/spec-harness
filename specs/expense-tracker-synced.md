# Spec — Synced expense tracker

- **Slug:** `expense-tracker-synced`
- **Source:** [seeds/02-contradiction.md](../seeds/02-contradiction.md)
- **Phase:** `/specify` · **Date:** 2026-06-21
- **Revised:** 2026-06-21 — clarifications resolved via interview (0 open questions remain).

## Problem & why

The user loses track of spending and wants a near-effortless way to record each
expense as it happens, have that record available wherever they are, and have a
copy reach their accountant automatically so bookkeeping isn't a separate chore.

## Users / actors

- **Primary:** the individual recording their own expenses.
- **Secondary (recipient only):** the accountant who receives emailed copies.

## User stories

- **US-1 (must):** As a spender, I want to add an expense in seconds, so I capture
  it before I forget.
- **US-2 (must):** As a spender, I want each expense automatically emailed to my
  accountant, so I never forward anything by hand.
- **US-3 (must):** As a spender, I want my expenses on both my phone and laptop
  and always matching, so I can review them anywhere.
- **US-4 (should):** As a spender, I want to see my recorded expenses, so I can
  review what I've spent.

## Functional requirements

- **FR-1:** The system lets the user record an expense consisting of a positive
  amount, a date, and a short description.
- **FR-2:** When an expense is recorded, the system automatically sends a copy of
  that expense to a configured accountant's email address.
- **FR-3:** The system keeps the user's expense data synchronized across multiple
  devices (phone and laptop) so every device shows the same data.
- **FR-4:** The system lets the user view the list of recorded expenses.
- **FR-5:** The system lets the user delete a recorded expense. (Editing an
  existing expense is out of scope.)

## Acceptance criteria

- **AC-1 (FR-1):** Given the app is open, when the user enters an amount, date, and
  description and confirms, then the expense appears in their list.
- **AC-2 (FR-1):** Given the user enters a zero or negative amount, when they
  confirm, then the system rejects it and nothing is recorded.
- **AC-3 (FR-2):** Given an accountant email is configured, when the user records
  an expense, then a copy of that expense is sent to that address with no further
  action.
- **AC-4 (FR-3):** Given the user records an expense on one device, when they open
  another device, then the same expense is present.
- **AC-5 (FR-4):** Given one or more expenses exist, when the user opens the list,
  then all recorded expenses are shown.
- **AC-6 (FR-5):** Given an expense exists, when the user deletes it, then it no
  longer appears in the list.

## Edge cases & error behavior

- Empty / zero / negative amount → rejected; recording requires a positive amount
  (refunds out of scope).
- Email send fails (recipient unreachable) → behavior unspecified.
- Two devices edited while offline, then reconnect → conflict behavior unspecified
  ("always match" does not say who wins).
- Viewing with no expenses yet → show an empty state.

## Non-goals / out of scope

- Budgets, category analytics, reports, charts.
- Multi-user / shared accounts.
- Multiple currencies.
- Receipt scanning / bank import.
- Editing an existing expense (delete-and-re-add only).

## Resolved questions (interview, 2026-06-21)

- Expense fields (FR-1): amount, date, short description. No category.
- Edit vs. delete (FR-5): delete only; editing out of scope.
- Amount validation: amounts must be positive; zero/negative rejected.

_No `[NEEDS CLARIFICATION]` markers remain._
