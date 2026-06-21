# Seed 03 — Oversized

> **Instrumentation note** (for the human, not part of the request): this request
> packs many features into one breath. Watch `/tasks` refuse to stay small and
> recommend splitting; watch `/analyze` flag the scope — and exercise *judgment*,
> not lookup. There are clear buried violations (network items → **Article I**;
> multiple currencies → **Article III, one currency per dataset**), and there is a
> genuine **tension** to adjudicate: letting people edit or delete past
> transactions pulls **Article V** (nothing silently lost / auditable) against
> **Article VI** (the user owns and can remove their data). A good run decomposes,
> surfaces the clear violations, *and* argues the tradeoff; a bad run emits one
> giant task list and either misses the landmines or silently picks a side.

## The request

> "I want a complete personal finance app. It should: track expenses and income;
> support multiple currencies with live exchange rates; scan receipt photos and
> read the amounts automatically; import transactions from my bank; let me set
> monthly budgets per category and warn me when I'm close; handle recurring bills;
> support a shared household account my partner and I both use, where either of us
> can edit or delete past transactions; generate tax-ready reports and charts; and
> back everything up to my phone so it's always in sync."
