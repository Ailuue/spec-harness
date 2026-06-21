# Engineering Learnings

A running log of the non-obvious lessons this project has taught me — worked out
by building it, not by reading about it. This repo is a harness for the
specify → plan → tasks → analyze workflow, so the earliest lessons are about
*designing a process that exposes its own value*; measured findings will accrue
here as the seeds actually get run. Chronological order, oldest first; new entries
at the bottom.

Each entry follows the same shape:

- **Context** — what I was doing and why.
- **Finding** — what I observed.
- **Action** — what I changed in response.
- **Result** — what happened (numbers where possible).
- **Takeaway** — the transferable principle.

---

## 2026-06-21 — Enforce a constraint with tooling, not with instructions

**Context.** The point of the `/analyze` phase is that a review is worth more when
the reviewer didn't write the thing being reviewed, and when it reports problems
rather than quietly patching them. The obvious implementation is to *tell* the
reviewer exactly that in the prompt.

**Finding.** Those instructions are necessary but not load-bearing. A model told
"don't fix it" will still helpfully reach for an edit tool when it spots a typo,
and a model told "review independently" can grade its own homework without
noticing. The discipline only holds if breaking it is *impossible*, not merely
discouraged.

**Action.** Two structural choices instead of two more sentences of prompt.
(1) Gave the [`validator`](.claude/agents/validator.md) subagent read-only tools
only — `Read, Grep, Glob`, no edit/write — so "reports but never fixes" is
enforced by the toolset. (2) Made [`/analyze`](.claude/commands/analyze.md)
delegate the audit to that separate agent, so it runs in a context that genuinely
never authored the spec, plan, or tasks.

**Result.** A review pass in this harness *cannot* mutate the artifacts it
reviews and *cannot* have written them — both are properties of the wiring, not
of the prompt holding. (Verifiable by reading the agent's tool list; the
end-to-end runs that show what it catches are still pending.)

**Takeaway.**

- When a rule matters, make it unbreakable by construction, not by instruction.
  Removing the capability (read-only tools) beats asking nicely — the same shape
  as keeping exact values out of a generative step entirely (good-news-feed's
  opaque-marker links). Constrain by architecture; verify the rest.
- "Independent review" means a different *context*, not just a different paragraph
  of prompt. If one context both authors and audits, it will be blind to its own
  gaps no matter how sternly you word the instruction.

---

## 2026-06-21 — Put the failure modes in the inputs, keep the process honest

**Context.** The harness has to *demonstrate* why the four-phase workflow earns
its ceremony. The tempting shortcut is to bake the lessons into the phase
commands themselves — e.g. hard-code `/tasks` to complain about scope.

**Finding.** If the friction lives in the process, the harness only "works" on
rigged inputs and teaches nothing transferable — the commands become theatre. The
friction has to be a property of *realistic requests* that honest, general-purpose
commands then surface on their own.

**Action.** Moved all the instrumentation into the seed inputs and kept the
commands general. Three seeds each carry a distinct, realistic defect: an
underspecified one-liner ([`01-vague`](seeds/01-vague.md)), a request that
violates a constitution article ([`02-contradiction`](seeds/02-contradiction.md)
→ network vs. Article I), and a kitchen-sink ask with landmines buried
mid-sentence ([`03-oversized`](seeds/03-oversized.md) → multi-currency vs.
Article III, plus network items). The commands contain no seed-specific logic.

**Result.** The four commands have zero references to the seeds (verifiable by
reading them), so the friction is purely a function of seed content — meaning the
same unmodified commands would surface the same problems on any real request with
the same defects. (How cleanly they actually surface them is what the first runs
will measure.)

**Takeaway.**

- To show a process is valuable, instrument the *inputs* with the failure modes,
  not the process. A harness whose signal comes from rigged steps proves nothing
  about the steps.
- This is the eval-design rule in another costume: the fixtures carry the signal,
  the runner stays neutral (good-news-feed's fixture/runner separation). The same
  principle showing up in a different domain is a good sign it's a real one.

---

## 2026-06-21 — Observed: the constitution gate stops a contradictory request before any design exists

**Context.** First end-to-end run of the harness, on the contradiction seed
([`02-contradiction`](seeds/02-contradiction.md)): `/specify` then `/plan`. The
question was whether the gate actually *stops* a request that conflicts with the
rules, or just complains while building it anyway.

**Finding.** It stopped — but in *two* stages, and the order was instructive.
(1) `/plan` first halted at **Gate 1 (spec readiness)** because the spec still had
three `[NEEDS CLARIFICATION]` markers (expense fields, edit/delete, validation) —
none of them the actual problem. The contradiction was *masked* behind unrelated
vagueness, and the constitution was never consulted on attempt 1. (2) Only after
the clarifications were resolved did `/plan` reach **Gate 2 (Constitution Check)**,
which flagged FR-2 (auto-email) and FR-3 (cloud sync) as conflicts with Article I
(local-first, no network) and failed the gate.

**Action.** Ran the pipeline as written and journaled both stops in
[`runs/LOG.md`](runs/LOG.md). No workaround was attempted — refusing to work
around the conflict is the whole point of the gate.

**Result (observed).**

| Step | Output produced |
|---|---|
| `/specify` | spec with 5 FRs, **3 open questions** |
| `/plan` attempt 1 | **0 lines of plan** — halted at Gate 1 |
| `/specify` revision | 0 open questions |
| `/plan` attempt 2 | **0 lines of plan** — Gate 2 FAILED, **2 of 5 FRs** flagged |

`plans/` never received a file; **no architecture or code was written** for a
request that is incompatible with the rules. The cost of discovering the conflict
was reading one spec.

**Takeaway.**

- The gate pays off exactly where it's cheapest: an unbuildable-as-asked request
  was rejected at the planning boundary, before a single design decision. A
  one-shot "just build it" prompt would have started implementing the email/sync
  feature and surfaced the conflict only as rework.
- **A readiness gate in front of the constitution gate lets vagueness hide a
  contradiction.** The Article I conflict was invisible on attempt 1 because
  unrelated open questions tripped first. Clarify fully, or the important check
  never runs.
- **Concrete harness improvement this run surfaced:** have `/plan` report *all*
  gate findings — including constitution conflicts — even when it halts on Gate 1,
  so a contradiction shows up on the first pass instead of the second. Running the
  harness on its own toy example is what exposed this — the harness doing its job
  on itself.

---

## 2026-06-21 — Independence and amnesia are the same coin: make the artifact carry its own decisions

**Context.** `/analyze` earns its rigor by reviewing in an isolated context — the
`validator` never watched the work being authored, so it can't rubber-stamp its own
reasoning.

**Finding.** That isolation has a twin cost I hadn't defended: amnesia. The reviewer
sees only the four files — not the conversation, not `runs/LOG.md`. So if `/specify`
guessed, the user corrected it in chat, and `/specify` wrote the resolved version up
as confident prose, the reviewer has no way to know a decision was ever contested. A
clean `/analyze` could just mean the guesses were *laundered into fact* before the
reviewer arrived. I had defended independence and left amnesia wide open.

**Action.** Made the artifact self-contained. `/specify` must now record every
resolved ambiguity in a **Decisions & assumptions** table (decision + basis:
`user-confirmed` / `assumed-default` / `constitution`); constitution Article X makes
that recording binding; and `/analyze` + the `validator` audit it. The teeth: the
reviewer doesn't just read the table — it *independently re-derives* what should have
required a decision and compares, so even a guess no one recognized as a guess gets
caught.

**Result.** A reviewer with zero memory of how the spec was produced can now
interrogate every judgment in it, and an empty Decisions section on a non-trivial
spec is itself a finding. (Effect on real catch-rate awaits a run that deliberately
plants a laundered guess.)

**Takeaway.**

- When you isolate a reviewer for independence, you also blind it. Pay that back by
  making the artifact carry everything needed to judge it — a decision that lives
  only in chat or a side-log is, to the reviewer, a decision that never happened.
- "It passed review" only means something if the review could see what was uncertain.
  Record decisions *with their basis*, and have the reviewer regenerate the
  expected-decisions list rather than trusting the one it was handed.
