/**
 * Tests for the deterministic checker (Art. VII spirit: the whole value of
 * trace.ts is correctness, so it's the one thing in this repo that earns a test
 * suite). Mix of small synthetic fixtures and a run against the repo's real
 * personal-finance-app artifact set, which is known-good.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildReport } from "../src/trace.js";
import { parseSpec, parsePlan, parseTasks, extractFrRefs } from "../src/parse.js";
import { parseBasis } from "../src/schema.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const GOOD_SPEC = `# Spec
## Functional requirements
- **FR-1:** Record an expense.
- **FR-2:** Delete an entry.
## Acceptance criteria
- **AC-1 (FR-1/2):** Given input, when confirmed, it appears.
## Decisions & assumptions
| Question | Decision | Basis |
|---|---|---|
| Currency | single | constitution (Art. III) |
## Open questions
_none_
`;

const GOOD_PLAN = `# Plan
## Constitution Check
| Requirement | Article · clause | Verdict |
|---|---|---|
| FR-1 record | II | PASS |
| FR-2 delete | V vs VI | **TENSION** |
## Requirement → design map
| FR | Satisfied by |
|---|---|
| FR-1 | entries.add |
| FR-2 | entries.delete |
`;

const GOOD_TASKS = `# Tasks
## Phase 1
- **T-1 · store.** Test: round-trip. Depends: —. Traces: infra (all FRs).
- **T-2 · add.** Test: appears. Depends: T-1. Traces: FR-1.
- **T-3 · delete.** Test: gone. Depends: T-2. Traces: FR-2.
`;

test("clean artifact set passes the gate", () => {
  const r = buildReport("fixture", GOOD_SPEC, GOOD_PLAN, GOOD_TASKS);
  assert.equal(r.ok, true, JSON.stringify(r.violations, null, 2));
  assert.equal(r.matrix.length, 2);
  assert.deepEqual(r.matrix.find((m) => m.fr === "FR-1")?.tasks, ["T-2"]);
  assert.equal(r.matrix.find((m) => m.fr === "FR-1")?.status, "ok");
});

test("FR absent from the design map is a DROPPED gate violation", () => {
  const plan = GOOD_PLAN.replace(/\| FR-2 \| entries.delete \|\n/, "");
  const r = buildReport("fixture", GOOD_SPEC, plan, GOOD_TASKS);
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "DROPPED_FR" && v.message.includes("FR-2")));
});

test("FR in the plan with no task (and no infra task) is an UNCOVERED gate violation", () => {
  // No "all FRs" infra task here, so FR-2's lack of a direct task is a real gap.
  const tasks = `# Tasks
## Phase 1
- **T-2 · add.** Test: appears. Depends: —. Traces: FR-1.
`;
  const r = buildReport("fixture", GOOD_SPEC, GOOD_PLAN, tasks);
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "UNCOVERED_FR" && v.message.includes("FR-2")));
});

test("task tracing to an unknown FR is an ORPHAN advisory, not a gate", () => {
  const tasks = GOOD_TASKS + "- **T-9 · stray.** Traces: FR-99.\n";
  const r = buildReport("fixture", GOOD_SPEC, GOOD_PLAN, tasks);
  assert.equal(r.ok, true, "orphan tasks must not fail the gate");
  assert.ok(r.violations.some((v) => v.code === "ORPHAN_TASK" && v.severity === "advisory"));
});

test("a leftover [NEEDS CLARIFICATION] marker gates", () => {
  const spec = GOOD_SPEC.replace("single", "single [NEEDS CLARIFICATION: which?]");
  const r = buildReport("fixture", spec, GOOD_PLAN, GOOD_TASKS);
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "UNRESOLVED_MARKER"));
});

test("a blocked task gates as an unresolved marker", () => {
  const tasks = GOOD_TASKS + "- **T-9 · warn.** Blocked: threshold undefined. Traces: FR-1.\n";
  const r = buildReport("fixture", GOOD_SPEC, GOOD_PLAN, tasks);
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "BLOCKED_TASK"));
});

test("infra-only coverage is advisory, not a gate", () => {
  // FR-2 keeps its plan element but loses its direct task; only the infra task
  // (T-1, "all FRs") touches it. That's a soft note for the reviewer, not a stop.
  const tasks = GOOD_TASKS.replace(/- \*\*T-3 · delete.*\n/, "");
  const r = buildReport("fixture", GOOD_SPEC, GOOD_PLAN, tasks);
  assert.equal(r.matrix.find((m) => m.fr === "FR-2")?.status, "infra-only");
  assert.ok(r.violations.some((v) => v.code === "INFRA_ONLY_FR" && v.severity === "advisory"));
  assert.equal(r.violations.filter((v) => v.severity === "gate").length, 0);
});

test("malformed artifact (no FR section) gates", () => {
  const r = buildReport("fixture", "# Spec\nno requirements here\n", GOOD_PLAN, GOOD_TASKS);
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "MALFORMED_ARTIFACT"));
});

test("Basis spelling drift parses but is an advisory note", () => {
  const spec = GOOD_SPEC.replace("constitution (Art. III)", "⚠ assumed");
  const r = buildReport("fixture", spec, GOOD_PLAN, GOOD_TASKS);
  assert.ok(r.violations.some((v) => v.code === "DRIFT" && v.severity === "advisory"));
  // drift must not, on its own, fail the gate
  assert.equal(r.violations.filter((v) => v.severity === "gate").length, 0);
});

test("extractFrRefs expands the FR-1/2 shorthand", () => {
  assert.deepEqual(extractFrRefs("(FR-1/2)"), ["FR-1", "FR-2"]);
  assert.deepEqual(extractFrRefs("Traces: FR-3, FR-5."), ["FR-3", "FR-5"]);
  assert.deepEqual(extractFrRefs("infra (all FRs)"), []);
});

test("parseBasis recognizes the documented vocabulary", () => {
  assert.equal(parseBasis("user-confirmed").kind, "user-confirmed");
  assert.equal(parseBasis("assumed-default").kind, "assumed-default");
  assert.equal(parseBasis("⚠ assumed").kind, "assumed-default");
  assert.equal(parseBasis("⚠ open tradeoff").kind, "open-tradeoff");
  const c = parseBasis("constitution (Art. III)");
  assert.equal(c.kind, "constitution");
  assert.equal(c.kind === "constitution" && c.article, "III");
  assert.equal(parseBasis("vibes").kind, "unknown");
});

test("the repo's real personal-finance-app set parses, and the gate catches its known T-11 gap", () => {
  const read = (k: string) => readFileSync(join(ROOT, k, "personal-finance-app.md"), "utf8");
  const specSrc = read("specs"), planSrc = read("plans"), tasksSrc = read("tasks");

  // It parses into the typed shapes with no structural/schema issues.
  const spec = parseSpec(specSrc), plan = parsePlan(planSrc), tasks = parseTasks(tasksSrc);
  assert.ok(spec.doc, "spec should parse: " + JSON.stringify(spec.issues));
  assert.ok(plan.doc, "plan should parse: " + JSON.stringify(plan.issues));
  assert.ok(tasks.doc, "tasks should parse: " + JSON.stringify(tasks.issues));
  assert.equal(spec.doc!.functionalRequirements.length, 8);

  // All 8 FRs are mapped + tasked, so there are NO dropped/uncovered violations...
  const r = buildReport("personal-finance-app", specSrc, planSrc, tasksSrc);
  assert.equal(r.violations.filter((v) => v.code === "DROPPED_FR" || v.code === "UNCOVERED_FR").length, 0);
  // ...but the gate still FAILS, because T-11 is blocked on an undefined warn
  // threshold — exactly the spec gap /tasks already flagged, caught mechanically.
  assert.equal(r.ok, false);
  assert.ok(r.violations.some((v) => v.code === "BLOCKED_TASK" && v.message.includes("T-11")));
});
