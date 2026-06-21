/**
 * Lift the structured bits out of each artifact's AST and validate them against
 * the Zod schemas. Each parse returns the typed doc plus a list of `issues`:
 *
 *  - "structure" issues are missing scaffolding (no Functional requirements
 *    section, no Decisions table) — the artifact is malformed.
 *  - "schema" issues are Zod failures (a bad FR id, an unrecognized Basis).
 *  - "drift" issues are cosmetic deviations from the documented spelling that
 *    still parse (e.g. `⚠ assumed` instead of `assumed-default`) — advisory.
 *
 * We never throw on a malformed artifact: a reviewer wants the findings, not a
 * stack trace.
 */
import {
  parseMarkdown,
  section,
  firstTable,
  tableRecords,
  listItemTexts,
  allListItemTexts,
} from "./md.js";
import {
  specDoc,
  planDoc,
  tasksDoc,
  parseBasis,
  type SpecDoc,
  type PlanDoc,
  type TasksDoc,
} from "./schema.js";
import type { ZodError } from "zod";

export type IssueKind = "structure" | "schema" | "drift";
export interface Issue {
  artifact: "spec" | "plan" | "tasks";
  kind: IssueKind;
  message: string;
}

export interface Parsed<T> {
  doc: T | undefined;
  issues: Issue[];
  /** Raw source, kept so the gate can scan for inline markers. */
  source: string;
}

/** Pull `FR-n` references out of free text, expanding the `FR-1/2` shorthand. */
export function extractFrRefs(s: string): string[] {
  const out: string[] = [];
  const re = /FR-(\d+)((?:\/\d+)*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    out.push(`FR-${m[1]}`);
    if (m[2]) for (const part of m[2].split("/").filter(Boolean)) out.push(`FR-${part}`);
  }
  return [...new Set(out)];
}

function zodIssues(artifact: Issue["artifact"], err: ZodError): Issue[] {
  return err.issues.map((i) => ({
    artifact,
    kind: "schema" as const,
    message: `${i.path.join(".") || "(root)"}: ${i.message}`,
  }));
}

/* -------------------------------------------------------------------- spec --- */

export function parseSpec(source: string): Parsed<SpecDoc> {
  const root = parseMarkdown(source);
  const issues: Issue[] = [];

  const frNodes = section(root, "Functional requirements");
  if (!frNodes) issues.push({ artifact: "spec", kind: "structure", message: "no `Functional requirements` section" });
  const functionalRequirements = listItemTexts(frNodes)
    .map((t) => {
      const m = t.match(/^(FR-\d+)\s*:?\s*(.*)$/s);
      return m ? { id: m[1]!, text: m[2]!.trim() } : undefined;
    })
    .filter((x): x is { id: string; text: string } => x !== undefined);

  const acNodes = section(root, "Acceptance criteria");
  const acceptanceCriteria = listItemTexts(acNodes)
    .map((t) => {
      const m = t.match(/^(AC-\d+)\s*(?:\(([^)]*)\))?\s*:?\s*(.*)$/s);
      if (!m) return undefined;
      return { id: m[1]!, refs: extractFrRefs(m[2] ?? ""), text: m[3]!.trim() };
    })
    .filter((x): x is { id: string; refs: string[]; text: string } => x !== undefined);

  const decNodes = section(root, "Decisions & assumptions");
  const decTable = firstTable(decNodes);
  if (!decNodes) issues.push({ artifact: "spec", kind: "structure", message: "no `Decisions & assumptions` section" });
  else if (!decTable) issues.push({ artifact: "spec", kind: "structure", message: "`Decisions & assumptions` has no table" });
  const decisions = decTable
    ? tableRecords(decTable).map((r) => ({
        question: stripBold(r["question"] ?? ""),
        decision: r["decision"] ?? "",
        basis: r["basis"] ?? "",
      }))
    : [];

  // Spelling-drift notes: parse cleanly but deviate from the documented spelling.
  for (const d of decisions) {
    const b = parseBasis(d.basis);
    if (b.kind === "assumed-default" && !/assumed-default/i.test(d.basis)) {
      issues.push({
        artifact: "spec",
        kind: "drift",
        message: `Decision "${truncate(d.question)}": Basis "${d.basis}" reads as assumed-default but specify.md spells it \`assumed-default\``,
      });
    }
  }

  // Open questions: the section may be absent (resolved) or hold the leftover markers.
  const oqNodes = section(root, "Open questions");
  const openQuestions = listItemTexts(oqNodes).filter((t) => t.trim().length > 0);

  const candidate = { functionalRequirements, acceptanceCriteria, decisions, openQuestions };
  const parsed = specDoc.safeParse(candidate);
  if (!parsed.success) issues.push(...zodIssues("spec", parsed.error));

  return { doc: parsed.success ? parsed.data : undefined, issues, source };
}

/* -------------------------------------------------------------------- plan --- */

export function parsePlan(source: string): Parsed<PlanDoc> {
  const root = parseMarkdown(source);
  const issues: Issue[] = [];

  const ccNodes = section(root, "Constitution Check");
  const ccTable = firstTable(ccNodes);
  if (!ccNodes) issues.push({ artifact: "plan", kind: "structure", message: "no `Constitution Check` section" });
  else if (!ccTable) issues.push({ artifact: "plan", kind: "structure", message: "`Constitution Check` has no table" });
  const constitutionCheck = ccTable
    ? tableRecords(ccTable).map((r) => ({
        requirement: r["requirement"] ?? "",
        article: r["article · clause"] ?? r["article"] ?? "",
        verdict: cleanVerdict(r["verdict"] ?? ""),
      }))
    : [];

  const mapNodes = section(root, "Requirement → design map") ?? section(root, "Requirement design map");
  const mapTable = firstTable(mapNodes);
  if (!mapNodes) issues.push({ artifact: "plan", kind: "structure", message: "no `Requirement → design map` section" });
  else if (!mapTable) issues.push({ artifact: "plan", kind: "structure", message: "`Requirement → design map` has no table" });
  const designMap = mapTable
    ? tableRecords(mapTable).map((r) => ({
        frs: extractFrRefs(r["fr"] ?? Object.values(r)[0] ?? ""),
        satisfiedBy: r["satisfied by"] ?? Object.values(r)[1] ?? "",
      }))
    : [];

  const candidate = { constitutionCheck, designMap };
  const parsed = planDoc.safeParse(candidate);
  if (!parsed.success) issues.push(...zodIssues("plan", parsed.error));

  return { doc: parsed.success ? parsed.data : undefined, issues, source };
}

/* ------------------------------------------------------------------- tasks --- */

export function parseTasks(source: string): Parsed<TasksDoc> {
  const root = parseMarkdown(source);
  const issues: Issue[] = [];

  const tasks = allListItemTexts(root)
    .map((t) => {
      const m = t.match(/^(T-\d+)\b/);
      if (!m) return undefined;
      const tracesM = t.match(/traces?\s*(?:to)?\s*:?\s*([^\n]*)$/i);
      const tracesStr = tracesM ? tracesM[1]! : "";
      return {
        id: m[1]!,
        title: t.split(/\.\s|·/)[0]!.replace(/^T-\d+\s*[·:.]?\s*/, "").trim() || t.slice(0, 60),
        traces: extractFrRefs(tracesStr),
        tracesInfra: /\binfra\b|\ball frs\b/i.test(tracesStr),
        blocked: /\bblocked\b/i.test(t),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== undefined);

  if (tasks.length === 0) issues.push({ artifact: "tasks", kind: "structure", message: "no `T-<n>` tasks found" });

  const oversized = /oversized/i.test(source);

  const candidate = { tasks, oversized };
  const parsed = tasksDoc.safeParse(candidate);
  if (!parsed.success) issues.push(...zodIssues("tasks", parsed.error));

  return { doc: parsed.success ? parsed.data : undefined, issues, source };
}

/* ----------------------------------------------------------------- helpers --- */

function stripBold(s: string): string {
  return s.replace(/\*\*/g, "").trim();
}

function truncate(s: string, n = 40): string {
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

function cleanVerdict(s: string): string {
  // Cells arrive as "**TENSION**" or "PASS"; the schema enum wants the bare word.
  const up = s.replace(/[*`]/g, "").trim().toUpperCase();
  return up;
}
