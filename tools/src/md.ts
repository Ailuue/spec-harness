/**
 * Thin markdown -> AST layer.
 *
 * We parse to an mdast tree (remark + gfm, so tables are real nodes) and lift
 * the structured bits out by walking that tree. The point of going through an
 * AST rather than regexing headings is that "the Decisions table" or "the
 * Functional requirements list" are *structural* facts — a heading and the
 * block that follows it — and the parser already knows that structure. Regex
 * would re-derive it badly.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString as mdToString } from "mdast-util-to-string";
import type { Root, RootContent, Heading, Table, List } from "mdast";

const processor = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(content: string): Root {
  return processor.parse(content) as Root;
}

/** Flatten any node's inline content to plain text (handles bold, code, links). */
export function text(node: { type: string } | RootContent): string {
  return mdToString(node as RootContent).trim();
}

/**
 * Return the run of top-level blocks that belong to a heading, i.e. everything
 * after the heading until the next heading of the same or shallower depth.
 * `title` is matched case-insensitively against the heading's plain text, with
 * loose whitespace so "Requirement -> design map" survives the arrow glyph.
 */
export function section(root: Root, title: string): RootContent[] | undefined {
  const want = normalizeTitle(title);
  const kids = root.children;
  for (let i = 0; i < kids.length; i++) {
    const h = kids[i];
    if (!h || h.type !== "heading") continue;
    if (normalizeTitle(text(h)) !== want) continue;
    const depth = (h as Heading).depth;
    const out: RootContent[] = [];
    for (let j = i + 1; j < kids.length; j++) {
      const n = kids[j];
      if (!n) continue;
      if (n.type === "heading" && (n as Heading).depth <= depth) break;
      out.push(n);
    }
    return out;
  }
  return undefined;
}

function normalizeTitle(s: string): string {
  // Collapse the few glyphs that drift between authors (arrows, middots) and
  // whitespace, so section lookup is robust to cosmetic edits.
  return s
    .toLowerCase()
    .replace(/[·→→·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First table node inside a block run. */
export function firstTable(nodes: RootContent[] | undefined): Table | undefined {
  return nodes?.find((n): n is Table => n.type === "table");
}

/**
 * Table as a matrix of trimmed cell strings, header row included at index 0.
 */
export function tableRows(table: Table): string[][] {
  return table.children.map((row) => row.children.map((cell) => text(cell)));
}

/** Body rows (header dropped), keyed by lower-cased header names. */
export function tableRecords(table: Table): Record<string, string>[] {
  const rows = tableRows(table);
  const header = (rows[0] ?? []).map((h) => h.toLowerCase());
  return rows.slice(1).map((row) => {
    const rec: Record<string, string> = {};
    header.forEach((key, i) => {
      rec[key] = row[i] ?? "";
    });
    return rec;
  });
}

/** Plain text of every list item found anywhere in the given block run. */
export function listItemTexts(nodes: RootContent[] | undefined): string[] {
  if (!nodes) return [];
  const out: string[] = [];
  const visit = (n: RootContent): void => {
    if (n.type === "list") {
      for (const item of (n as List).children) out.push(text(item));
    }
    // Recurse into containers that may hold nested lists.
    const kids = (n as { children?: RootContent[] }).children;
    if (kids && n.type !== "list") for (const k of kids) visit(k);
  };
  for (const n of nodes) visit(n);
  return out;
}

/** All list-item texts in the whole document (used for tasks, which live under per-phase headings). */
export function allListItemTexts(root: Root): string[] {
  return listItemTexts(root.children);
}
