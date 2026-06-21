# Plan — Personal finance app (local core)

- **Slug:** `personal-finance-app`
- **Spec:** [specs/personal-finance-app.md](../specs/personal-finance-app.md)
- **Phase:** `/plan` · **Date:** 2026-06-21

## Constitution Check

| Requirement | Article · clause | Verdict |
|---|---|---|
| FR-1 record expense | II (integer minor units), IV (one JSON file) | PASS |
| FR-2 record income | II, IV | PASS |
| FR-3 edit entry | **V (nothing silently lost) vs VI (user can remove data)** | **TENSION** |
| FR-4 delete entry | **V vs VI** | **TENSION** |
| FR-5 categories | IV | PASS |
| FR-6 budgets + warn | II (compare in minor units), IV | PASS |
| FR-7 recurring | IV | PASS |
| FR-8 report + export | IV (export to a **local** file — not network) | PASS |

No CONFLICTs. One tension, argued below.

### TENSION adjudication — edit/delete (FR-3, FR-4)

The options:

- **Hard-erase** the record. Honors **VI** maximally (the data is truly gone); breaks
  **V** (a record vanishes with no trace it ever existed).
- **Soft-delete / full history** (tombstone keeping the old values). Honors **V**
  (fully auditable); breaks **VI** (the "removed" data is silently retained — exactly
  the hidden retention VI forbids).

**Decision (chosen): erase the payload, keep a minimal trace.** On delete, remove the
entry's financial content (amount, description, category) from the active dataset, and
append one line to an audit log recording *that* an entry was removed and *when*
(`{action: deleted, entryId, ts}`) — **no amount or description retained**. On edit,
apply the change in place and append `{action: edited, entryId, ts, fields}` naming
*which* fields changed — **without storing the prior values**.

**Why this threads both articles:** nothing is *silently* lost (V — the dataset can
always show that, and when, a record changed or was removed), yet the user's actual
financial data is genuinely gone, not hidden (VI). A stricter reading of V — keep full
prior values — was rejected because it directly defeats VI for a single-user tool the
user controls.

**Residual risk (flagged for /analyze):** the edit path notes *that* a value changed
but not *what it was*, so "how it got there" under V is only partially served for
edits. Accepted for this core; revisit if an audit trail of values is ever required.

## Approach

A single local JSON file holds the dataset. A thin set of modules read it, mutate it
in memory, and write it back atomically. Money is integer minor units throughout. A
fixed currency is stored once at the top of the file.

## Data model (one JSON file — Art. IV)

```
{
  "currency": "USD",
  "categories": ["Groceries", "Rent", ...],
  "entries": [
    { "id": "e1", "kind": "expense|income", "amountMinor": 1299,
      "date": "2026-06-21", "description": "...", "category": "Groceries" }
  ],
  "budgets": { "Groceries": 40000 },              // monthly limit, minor units
  "recurring": [
    { "id": "r1", "kind": "expense", "amountMinor": 120000, "description": "Rent",
      "category": "Rent", "schedule": "monthly", "nextDate": "2026-07-01" }
  ],
  "audit": [ { "action": "deleted", "entryId": "e7", "ts": "..." } ]   // trace only
}
```

## Modules / units

- **store** — load / atomically save the JSON file (Art. IV).
- **money** — parse and format integer minor units; never floats (Art. II).
- **entries** — add / edit / delete; edit & delete append to **audit** (the adjudication).
- **categories** — define / list / manage.
- **budgets** — month-to-date total per category; warn when ≥ threshold.
- **recurring** — materialize due recurring entries on run.
- **reports** — totals per category / period; export to a local file.

## Sequencing

`store` + `money` → `entries` (+ audit) → `categories` → `budgets` → `recurring` →
`reports`.

## Requirement → design map

| FR | Satisfied by |
|---|---|
| FR-1, FR-2 | entries.add |
| FR-3 | entries.edit (+ audit) |
| FR-4 | entries.delete (+ audit) |
| FR-5 | categories |
| FR-6 | budgets |
| FR-7 | recurring |
| FR-8 | reports (export via store, local file) |
