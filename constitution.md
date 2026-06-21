# Constitution

Standing rules for everything built in this repo. These are **always loaded**
and **binding**. No spec, plan, task, or implementation may violate an article.
An article can only be set aside by *amending this file* — with a written
justification — never by working around it in a later phase.

> How to use: every command reads this file first. `/plan` runs an explicit
> **Constitution Check** gate against it, citing the specific article *and clause*
> each requirement touches. `/analyze` re-checks independently. Most articles are
> bright lines you can verify by inspection; a few state principles whose
> application takes judgment, not lookup — applying those is a decision to be
> argued, not a box to tick.

---

## Article I — Local-first and private

Everything runs and stays on a single machine. No network access, no telemetry,
no analytics, no third-party services, no cloud sync, no email / SMS / push.
Data never leaves the device. If a requirement needs the network, it violates
this article.

## Article II — Money is exact

Monetary amounts are stored and computed as **integer minor units** (e.g.
cents). Floating-point math on money is forbidden. (This is one rule: the
integer representation *is* the prohibition on floats.)

## Article III — One currency per dataset

A dataset records amounts in a **single fixed currency**. Multiple currencies,
or converting between them, are out of scope unless this article is amended.

## Article IV — Plain, durable storage

State persists to a single **human-readable local file** (JSON) the user can
open, diff, and back up by copying. No database engine, no binary format, no
migration framework.

## Article V — Nothing is silently lost

A recorded expense, and any change to one, is durable: the system can always say
what it holds and how it got there, and it does not discard or overwrite a record
without leaving a trace. What counts as "a trace" is a judgment call for the
design to make and defend.

## Article VI — The user owns their data

Keep only what a feature actually needs, and honor a user's request to remove
their data. No hidden retention, no collecting "just in case." What counts as
"needed," and what "removal" means in practice, are judgment calls for the design
to make and defend.

## Article VII — Test-first

Every behavior has a test written **before** its implementation. No
implementation unit is "done" until its test exists and passes.

## Article VIII — Small, reversible steps

Work proceeds in small, independently verifiable units. If a unit of work cannot
be described, tested, and checked on its own, it is too big and must be split.

## Article IX — Phases are sequential and gated

`spec → plan → tasks → implementation`. No "how" in the spec. No code in the
plan. No implementation before tasks exist. Each phase gates the next; a phase
may refuse to proceed and send work back.

## Article X — The spec owns "what"; the plan owns "how"

Requirements live only in the spec and must be observable and testable. A later
phase may **not** introduce a requirement that is not in the spec. And every
ambiguity the spec resolves is **recorded in the spec** — with what was decided
and on what basis — not left behind in a conversation a later reviewer cannot
see. A decision that exists only in chat did not happen, as far as the artifact
is concerned.
