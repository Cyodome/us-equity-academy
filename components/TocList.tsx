"use client";

import Link from "next/link";
import { parts, type TocItem } from "@/lib/toc-shared";
import { IconCheck } from "./Icons";

export function TocList({
  toc,
  currentId,
  read,
  activeSection,
}: {
  toc: TocItem[];
  currentId?: string;
  read: Record<string, number>;
  activeSection?: string | null;
}) {
  return (
    <div className="space-y-5 text-[0.86rem]">
      {parts.map((p) => {
        const items = toc.filter((t) => t.part === p.num);
        return (
          <section key={p.num}>
            <p className="mb-1.5 flex items-baseline gap-2 text-[0.72rem] text-muted">
              <span className="serif font-extrabold text-amber">{p.roman === "付" ? "付録" : `第${p.roman}部`}</span>
              {p.roman !== "付" && <span className="truncate">{p.title}</span>}
            </p>
            <ul className="space-y-0.5">
              {items.map((t) => {
                const active = t.id === currentId;
                const done = !!read[t.id];
                return (
                  <li key={t.id}>
                    <Link
                      href={`/chapters/${t.id}/`}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                        active ? "bg-blue-soft text-ink" : "text-text hover:bg-surface-2"
                      }`}
                    >
                      <span
                        className={`mt-[0.2rem] grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.6rem] ${
                          done ? "border-up bg-up text-white" : "border-line-strong text-transparent"
                        }`}
                        aria-label={done ? "読了" : "未読"}
                      >
                        <IconCheck className="h-3 w-3" />
                      </span>
                      <span className="min-w-0">
                        <span className="mr-1.5 text-muted tnum">{t.id === "intro" ? "前提" : t.id === "appendix" ? "付録" : t.num}</span>
                        <span className={active ? "font-bold" : ""}>{t.title}</span>
                      </span>
                    </Link>
                    {active && t.sections.length > 0 && (
                      <ul className="mb-1 ml-[1.6rem] mt-0.5 border-l border-line pl-2">
                        {t.sections.map((s) => (
                          <li key={s.id}>
                            <a
                              href={`#${s.id}`}
                              className={`block truncate rounded px-2 py-1 text-[0.8rem] transition-colors ${
                                activeSection === s.id ? "text-blue font-bold" : "text-muted hover:text-ink"
                              }`}
                            >
                              {s.num && <span className="mr-1.5 tnum">{s.num}</span>}
                              {s.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
