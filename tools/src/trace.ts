#!/usr/bin/env tsx
/**
 * Deterministic FR -> plan -> task traceability checker.
 *
 * /analyze and the validator agent currently build this matrix by hand. That is
 * graph reachability — cheap, mechanical, and exactly the kind of bookkeeping an
 * LLM gets subtly wrong under load. trace.ts does the bookkeeping so the reviewer
 * can spend its budget on judgment (the Art. V vs VI tension, laundered
 * assumptions). It does NOT replace /analyze.
 *
 * Severity, per the harness owner's call:
 *   GATE     -> dropped FRs, uncovered FRs, unresolved markers, malformed
 *               artifacts. Non-zero exit. Meant to fire UPSTREAM of the LLM
 *               reviewer, so a broken artifact set never burns reviewer budget.
 *   ADVISORY -> orphan tasks, infra-only coverage, spelling drift. Exit 0.
 *               These are context for the reviewer, not a stop.
 */
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { parseSpec, parsePlan, parseTasks, type Issue } from "./parse.js";
import type { SpecDoc, PlanDoc, TasksDoc } from "./schema.js";

export type Severity = "gate" | "advisory";

export interface Violation {
  severity: Severity;
  code:
    | "DROPPED_FR"
    | "UNCOVERED_FR"
    | "UNRESOLVED_MARKER"
    | "BLOCKED_TASK"
    | "MALFORMED_ARTIFACT"
    | "ORPHAN_TASK"
    | "INFRA_ONLY_FR"
    | "DRIFT";
  message: string;
}

export interface MatrixRow {
  fr: string;
  text: string;
  planElements: string[];
  tasks: string[];
  infraTasks: string[];
  status: "ok" | "dropped" | "uncovered" | "infra-only";
}

export interface TraceReport {
  slug: string;
  matrix: MatrixRow[];
  violations: Violation[];
  parseIssues: Issue[];
  ok: boolean; // no gate-level violations
}

// The documented marker form carries a question after a colon
// ("[NEEDS CLARIFICATION: <the specific question>]"). Requiring the colon avoids
// firing on prose that merely *mentions* the marker, e.g. "No [NEEDS
// CLARIFICATION] markers remain."
const MARKER_RE = /\[NEEDS CLARIFICATION:/i;

export function buildReport(
  slug: string,
  specSrc: string,
  planSrc: string,
  tasksSrc: string,
): TraceReport {
  const spec = parseSpec(specSrc);
  const plan = parsePlan(planSrc);
  const tasks = parseTasks(tasksSrc);

  const parseIssues = [...spec.issues, ...plan.issues, ...tasks.issues];
  const violations: Violation[] = [];

  // Malformed artifacts gate before anything else: we can't trust the graph.
  for (const i of parseIssues) {
    if (i.kind === "structure" || i.kind === "schema") {
      violations.push({
        severity: "gate",
        code: "MALFORMED_ARTIFACT",
        message: `[${i.artifact}] ${i.message}`,
      });
    } else if (i.kind === "drift") {
      violations.push({ severity: "advisory", code: "DRIFT", message: `[${i.artifact}] ${i.message}` });
    }
  }

  const matrix = spec.doc
    ? buildMatrix(spec.doc, plan.doc, tasks.doc)
    : [];

  // --- coverage gates -----------------------------------------------------
  for (const row of matrix) {
    if (row.status === "dropped") {
      violations.push({
        severity: "gate",
        code: "DROPPED_FR",
        message: `${row.fr} has no plan element in the Requirement → design map (dropped requirement)`,
      });
    } else if (row.status === "uncovered") {
      violations.push({
        severity: "gate",
        code: "UNCOVERED_FR",
        message: `${row.fr} is in the plan but no task traces to it (uncovered requirement)`,
      });
    } else if (row.status === "infra-only") {
      violations.push({
        severity: "advisory",
        code: "INFRA_ONLY_FR",
        message: `${row.fr} is covered only by infra/"all FRs" tasks (${row.infraTasks.join(", ")}); no FR-specific task — confirm that's intended`,
      });
    }
  }

  // --- orphan tasks (advisory): a task tracing to an FR the spec doesn't have,
  //     or tracing to nothing at all and not marked infra ---------------------
  if (tasks.doc && spec.doc) {
    const frSet = new Set(spec.doc.functionalRequirements.map((f) => f.id));
    for (const t of tasks.doc.tasks) {
      const unknown = t.traces.filter((fr) => !frSet.has(fr));
      if (unknown.length > 0) {
        violations.push({
          severity: "advisory",
          code: "ORPHAN_TASK",
          message: `${t.id} traces to unknown requirement(s): ${unknown.join(", ")}`,
        });
      } else if (t.traces.length === 0 && !t.tracesInfra) {
        violations.push({
          severity: "advisory",
          code: "ORPHAN_TASK",
          message: `${t.id} traces to no FR (possible scope creep)`,
        });
      }
    }
  }

  // --- unresolved markers (gate) -----------------------------------------
  if (MARKER_RE.test(specSrc)) {
    violations.push({
      severity: "gate",
      code: "UNRESOLVED_MARKER",
      message: "spec still contains a [NEEDS CLARIFICATION] marker",
    });
  }
  if (spec.doc && spec.doc.openQuestions.length > 0) {
    violations.push({
      severity: "gate",
      code: "UNRESOLVED_MARKER",
      message: `spec Open questions section is non-empty (${spec.doc.openQuestions.length} item(s))`,
    });
  }
  if (tasks.doc) {
    for (const t of tasks.doc.tasks) {
      if (t.blocked) {
        violations.push({
          severity: "gate",
          code: "BLOCKED_TASK",
          message: `${t.id} is marked blocked — an unresolved gap pointing back upstream`,
        });
      }
    }
  }

  const ok = !violations.some((v) => v.severity === "gate");
  return { slug, matrix, violations, parseIssues, ok };
}

function buildMatrix(
  spec: SpecDoc,
  plan: PlanDoc | undefined,
  tasks: TasksDoc | undefined,
): MatrixRow[] {
  // FR -> plan elements (from the Requirement → design map).
  const planByFr = new Map<string, string[]>();
  for (const r of plan?.designMap ?? []) {
    for (const fr of r.frs) {
      planByFr.set(fr, [...(planByFr.get(fr) ?? []), r.satisfiedBy]);
    }
  }

  // FR -> tasks (direct) and infra tasks (apply to all FRs).
  const tasksByFr = new Map<string, string[]>();
  const infraTaskIds: string[] = [];
  for (const t of tasks?.tasks ?? []) {
    if (t.tracesInfra) infraTaskIds.push(t.id);
    for (const fr of t.traces) {
      tasksByFr.set(fr, [...(tasksByFr.get(fr) ?? []), t.id]);
    }
  }

  return spec.functionalRequirements.map((fr) => {
    const planElements = planByFr.get(fr.id) ?? [];
    const directTasks = tasksByFr.get(fr.id) ?? [];
    let status: MatrixRow["status"];
    if (planElements.length === 0) status = "dropped";
    else if (directTasks.length > 0) status = "ok";
    else if (infraTaskIds.length > 0) status = "infra-only";
    else status = "uncovered";
    return {
      fr: fr.id,
      text: fr.text,
      planElements,
      tasks: directTasks,
      infraTasks: status === "infra-only" ? infraTaskIds : [],
      status,
    };
  });
}

/* --------------------------------------------------------------- rendering --- */

export function renderReport(r: TraceReport, useColor = true): string {
  const c = makeColor(useColor);
  const lines: string[] = [];
  lines.push(c.bold(`Traceability — ${r.slug}`));
  lines.push("");

  // Matrix
  const head = ["FR", "Plan element(s)", "Task(s)", "Status"];
  const body = r.matrix.map((row) => [
    row.fr,
    row.planElements.join(", ") || "—",
    row.status === "infra-only" ? `${row.infraTasks.join(", ")} (infra)` : row.tasks.join(", ") || "—",
    statusLabel(c, row.status),
  ]);
  lines.push(table([head, ...body]));
  lines.push("");

  const gates = r.violations.filter((v) => v.severity === "gate");
  const advisories = r.violations.filter((v) => v.severity === "advisory");

  if (gates.length) {
    lines.push(c.red(c.bold(`GATE — ${gates.length} blocking violation(s) (fix before /analyze):`)));
    for (const v of gates) lines.push(c.red(`  ✗ [${v.code}] ${v.message}`));
    lines.push("");
  }
  if (advisories.length) {
    lines.push(c.yellow(c.bold(`Advisory — ${advisories.length} note(s) for the reviewer:`)));
    for (const v of advisories) lines.push(c.yellow(`  • [${v.code}] ${v.message}`));
    lines.push("");
  }

  lines.push(
    r.ok
      ? c.green("✓ Trace gate PASSED — mechanical checks clean; hand off to /analyze for judgment.")
      : c.red("✗ Trace gate FAILED — return to the phase each finding names before spending reviewer budget."),
  );
  return lines.join("\n");
}

function statusLabel(c: Color, s: MatrixRow["status"]): string {
  switch (s) {
    case "ok": return c.green("ok");
    case "dropped": return c.red("DROPPED");
    case "uncovered": return c.red("UNCOVERED");
    case "infra-only": return c.yellow("infra-only");
  }
}

function table(rows: string[][]): string {
  const widths: number[] = [];
  for (const row of rows) row.forEach((cell, i) => {
    widths[i] = Math.max(widths[i] ?? 0, stripAnsi(cell).length);
  });
  const fmt = (row: string[]) =>
    "  " + row.map((cell, i) => cell + " ".repeat((widths[i] ?? 0) - stripAnsi(cell).length)).join("  │  ");
  const sep = "  " + widths.map((w) => "─".repeat(w)).join("──┼──");
  return [fmt(rows[0]!), sep, ...rows.slice(1).map(fmt)].join("\n");
}

/* ----------------------------------------------------------------- color ---- */

interface Color {
  bold: (s: string) => string;
  red: (s: string) => string;
  green: (s: string) => string;
  yellow: (s: string) => string;
}
function makeColor(on: boolean): Color {
  const wrap = (code: string) => (s: string) => (on ? `\x1b[${code}m${s}\x1b[0m` : s);
  return { bold: wrap("1"), red: wrap("31"), green: wrap("32"), yellow: wrap("33") };
}
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/* ------------------------------------------------------------------- CLI ---- */

function findRepoRoot(start: string): string {
  let dir = start;
  for (let i = 0; i < 12; i++) {
    try {
      readFileSync(join(dir, "constitution.md"));
      return dir;
    } catch {
      const up = dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  return start;
}

function main(argv: string[]): number {
  const args = argv.filter((a) => !a.startsWith("--"));
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const slug = args[0];
  if (!slug) {
    process.stderr.write("usage: trace <slug> [--json] [--no-color] [--root <dir>]\n");
    return 2;
  }

  const rootFlag = argv.indexOf("--root");
  const root = rootFlag >= 0 && argv[rootFlag + 1]
    ? resolve(argv[rootFlag + 1]!)
    : findRepoRoot(process.cwd());

  const read = (kind: "specs" | "plans" | "tasks") => {
    const p = join(root, kind, `${slug}.md`);
    try {
      return readFileSync(p, "utf8");
    } catch {
      return undefined;
    }
  };

  const specSrc = read("specs");
  const planSrc = read("plans");
  const tasksSrc = read("tasks");

  const missing = [
    ["specs", specSrc],
    ["plans", planSrc],
    ["tasks", tasksSrc],
  ].filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) {
    process.stderr.write(`missing artifact(s) for "${slug}": ${missing.join(", ")} (looked under ${root})\n`);
    return 2;
  }

  const report = buildReport(slug, specSrc!, planSrc!, tasksSrc!);

  if (flags.has("--json")) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(renderReport(report, !flags.has("--no-color")) + "\n");
  }

  return report.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
