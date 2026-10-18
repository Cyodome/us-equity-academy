import fs from "node:fs";
import path from "node:path";

export type Section = { id: string; num: string | null; title: string; body: string };
export type Chapter = {
  id: string;
  num: number;
  part: number;
  title: string;
  subtitle?: string;
  lead: string;
  preamble: string;
  sections: Section[];
};

import { parts, type TocItem } from "./toc-shared";
export { parts };
export type { TocItem };

const order = ["ch01", "ch02", "intro2", "ch03", "ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch10", "ch11", "ch12", "ch13", "ch14", "ch15", "appendix"];

function parseFrontmatter(src: string) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("frontmatter missing");
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

let cache: Chapter[] | null = null;

export function getChapters(): Chapter[] {
  if (cache) return cache;
  const dir = path.join(process.cwd(), "content", "chapters");
  cache = order.map((file) => {
    const src = fs.readFileSync(path.join(dir, `${file}.md`), "utf8");
    const { meta, body } = parseFrontmatter(src);
    const chunks = body.split(/^### /m);
    const preamble = chunks.shift()!.trim();
    const sections: Section[] = chunks.map((chunk, i) => {
      const nl = chunk.indexOf("\n");
      const heading = chunk.slice(0, nl).trim();
      const m = heading.match(/^([0-9]+-[0-9]+|[A-Z])\s+(.*)$/);
      const num = m ? m[1] : null;
      return {
        id: num ? `s${num}` : `s${i + 1}`,
        num,
        title: m ? m[2] : heading,
        body: chunk.slice(nl + 1).trim(),
      };
    });
    return {
      id: meta.id,
      num: Number(meta.num),
      part: Number(meta.part),
      title: meta.title,
      subtitle: meta.subtitle,
      lead: meta.lead,
      preamble,
      sections,
    };
  });
  return cache;
}

export function getChapter(id: string) {
  return getChapters().find((c) => c.id === id);
}

export function chapterLabel(c: { id: string; num: number }) {
  if (c.id === "intro") return "第II部の前提";
  if (c.id === "appendix") return "付録";
  return `第${c.num}章`;
}

// クライアントへ渡す軽量な目次
export function getToc(): TocItem[] {
  return getChapters().map((c) => ({
    id: c.id,
    num: c.num,
    part: c.part,
    title: c.title,
    subtitle: c.subtitle,
    lead: c.lead,
    label: chapterLabel(c),
    sections: c.sections.map((s) => ({ id: s.id, num: s.num, title: s.title })),
  }));
}
