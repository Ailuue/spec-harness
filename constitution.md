# Constitution

Standing rules for everything built in this repo. These are **always loaded**
and **binding**. No spec, plan, task, or implementation may violate an article.
An article can only be set aside by *amending this file* — with a written
justification — never by working around it in a later phase.

> How to use: every command reads this file first. The `/plan` phase runs an
> explicit **Constitution Check** gate against it. `/analyze` re-checks every
> artifact against it independently.

---

## Article I — Local-first and private

Everything runs and stays on a single machine. No network access, no telemetry,
no analytics, no third-party services, no cloud sync, no email / SMS / push.
Data never leaves the device. If a requirement needs the network, it violates
this article.

## Article II — Money is exact, in one currency

Monetary amounts are stored and computed as **integer minor units** (e.g.
cents). Floating-point math on money is forbidden. The dataset uses a **single
fixed currency**; multi-currency is out of scope unless this article is amended.

## Article III — Plain, durable storage

State persists to a single **human-readable local file** (JSON) the user can
open, diff, and back up by copying. No database engine, no binary format, no
migration framework.

## Article IV — Test-first

Every behavior has a test written **before** its implementation. No
implementation unit is "done" until its test exists and passes.

## Article V — Small, reversible steps

Work proceeds in small, independently verifiable units. If a unit of work cannot
be described, tested, and checked on its own, it is too big and must be split.

## Article VI — Phases are sequential and gated

`spec → plan → tasks → implementation`. No "how" in the spec. No code in the
plan. No implementation before tasks exist. Each phase gates the next; a phase
may refuse to proceed and send work back.

## Article VII — The spec owns "what"; the plan owns "how"

Requirements live only in the spec and must be observable and testable. A later
phase may **not** introduce a requirement that is not in the spec. If the plan
or tasks "need" a new requirement, that is a signal to return to `/specify`.
