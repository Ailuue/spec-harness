/**
 * Zod schemas for the implicit structure of each artifact.
 *
 * Today these shapes are enforced only by prose in the command files
 * (.claude/commands/*.md): a spec "must have" numbered FRs, a Decisions &
 * assumptions table whose Basis column is one of a fixed set, an Open questions
 * section; a plan "must have" a Constitution Check table with a constrained
 * verdict vocabulary and a Requirement -> design map; tasks "must" each trace to
 * an FR. Encoding that here turns "the reviewer should notice X is malformed"
 * into "X does not parse."
 */
import { z } from "zod";

export const FR_ID = /^FR-\d+$/;
export const AC_ID = /^AC-\d+$/;
export const TASK_ID = /^T-\d+$/;

export const frId = z.string().regex(FR_ID, "expected an FR-<n> id");
export const acId = z.string().regex(AC_ID, "expected an AC-<n> id");
export const taskId = z.string().regex(TASK_ID, "expected a T-<n> id");

/* ------------------------------------------------------------------ Basis --- */

/**
 * specify.md says Basis is "one of `user-confirmed`, `assumed-default`, or
 * `constitution (Art. N)`", and that an unconfirmed call is marked `⚠ assumed`,
 * with `⚠ open tradeoff` for an article clash left for /plan. That's the
 * canonical vocabulary. Real specs in this repo already drift from the exact
 * spelling (they write `⚠ assumed`, not `assumed-default`), so we parse to a
 * normalized kind and let the caller decide whether the *spelling* drift is
 * worth a note — the structure is what must hold.
 */
export type Basis =
  | { kind: "user-confirmed"; flagged: boolean; raw: string }
  | { kind: "assumed-default"; flagged: boolean; raw: string }
  | { kind: "constitution"; article: string; raw: string }
  | { kind: "open-tradeoff"; raw: string }
  | { kind: "unknown"; raw: string };

export const CANONICAL_BASIS = [
  "user-confirmed",
  "assumed-default",
  "constitution (Art. N)",
] as const;

export function parseBasis(rawInput: string): Basis {
  const raw = rawInput.trim();
  const flagged = /⚠/.test(raw);
  const s = raw.replace(/⚠/g, "").trim().toLowerCase();

  const art = s.match(/constitution\s*\(art\.\s*([ivxlcdm\d]+)\)/i);
  if (art) return { kind: "constitution", article: art[1]!.toUpperCase(), raw };
  if (s.includes("open tradeoff") || s.includes("open trade-off"))
    return { kind: "open-tradeoff", raw };
  if (s.includes("user-confirmed") || s.includes("user confirmed"))
    return { kind: "user-confirmed", flagged, raw };
  if (s.includes("assumed")) return { kind: "assumed-default", flagged, raw };
  return { kind: "unknown", raw };
}

/** True when the basis is recognized at all (vs. an unparseable value). */
const basisString = z
  .string()
  .refine((v) => parseBasis(v).kind !== "unknown", {
    message: `Basis must be one of: ${CANONICAL_BASIS.join(", ")} (⚠ assumed / ⚠ open tradeoff accepted)`,
  });

/* -------------------------------------------------------------------- Spec --- */

export const functionalRequirement = z.object({
  id: frId,
  text: z.string().min(1, "FR has no text"),
});

export const acceptanceCriterion = z.object({
  id: acId,
  refs: z.array(frId), // FRs this AC exercises, e.g. (FR-1/2)
  text: z.string().min(1),
});

export const decision = z.object({
  question: z.string().min(1),
  decision: z.string().min(1),
  basis: basisString,
});

export const specDoc = z.object({
  slug: z.string().optional(),
  functionalRequirements: z
    .array(functionalRequirement)
    .min(1, "a spec must have at least one FR"),
  acceptanceCriteria: z.array(acceptanceCriterion),
  decisions: z.array(decision),
  openQuestions: z.array(z.string()),
});

/* -------------------------------------------------------------------- Plan --- */

export const VERDICTS = ["PASS", "CONFLICT", "TENSION"] as const;
export const verdict = z.enum(VERDICTS);

export const constitutionRow = z.object({
  requirement: z.string().min(1),
  article: z.string().min(1),
  verdict,
});

export const designMapRow = z.object({
  frs: z.array(frId), // an FR cell may list several: "FR-1, FR-2"
  satisfiedBy: z.string().min(1),
});

export const planDoc = z.object({
  slug: z.string().optional(),
  constitutionCheck: z.array(constitutionRow),
  designMap: z.array(designMapRow).min(1, "a plan must map requirements to design"),
});

/* ------------------------------------------------------------------- Tasks --- */

export const task = z.object({
  id: taskId,
  title: z.string().min(1),
  traces: z.array(frId), // explicit FRs this task serves
  tracesInfra: z.boolean(), // "infra (all FRs)" wildcard
  blocked: z.boolean(),
});

export const tasksDoc = z.object({
  slug: z.string().optional(),
  tasks: z.array(task).min(1, "tasks file has no tasks"),
  oversized: z.boolean(),
});

export type FunctionalRequirement = z.infer<typeof functionalRequirement>;
export type AcceptanceCriterion = z.infer<typeof acceptanceCriterion>;
export type Decision = z.infer<typeof decision>;
export type SpecDoc = z.infer<typeof specDoc>;
export type ConstitutionRow = z.infer<typeof constitutionRow>;
export type DesignMapRow = z.infer<typeof designMapRow>;
export type PlanDoc = z.infer<typeof planDoc>;
export type Task = z.infer<typeof task>;
export type TasksDoc = z.infer<typeof tasksDoc>;
export type Verdict = (typeof VERDICTS)[number];
