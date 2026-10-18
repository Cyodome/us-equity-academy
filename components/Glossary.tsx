"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { glossary } from "@/lib/glossary";
import { IconSearch } from "./Icons";

export function Glossary() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return glossary;
    return glossary.filter((t) => (t.term + t.meaning).toLowerCase().includes(k));
  }, [q]);
  return (
    <div className="not-prose space-y-3">
      <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 focus-within:border-blue">
        <IconSearch className="h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="用語を検索（例：PER、希薄化、板）"
          className="w-full bg-transparent text-[0.92rem] outline-none placeholder:text-muted"
          aria-label="用語を検索"
        />
        <span className="shrink-0 text-[0.75rem] text-muted tnum">{list.length}件</span>
      </label>
      <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {list.map((t) => (
          <div key={t.term} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-4">
            <dt className="font-bold text-ink">{t.term}</dt>
            <dd className="text-[0.88rem] leading-relaxed">{t.meaning}</dd>
            {t.ch && (
              <dd className="text-[0.75rem]">
                <Link href={`/chapters/${t.ch}/`} className="text-blue underline underline-offset-4">
                  第{t.ch.replace("ch", "")}章
                </Link>
              </dd>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="px-4 py-6 text-center text-[0.88rem] text-muted">該当する用語はありません。別の言葉で検索してください。</p>}
      </dl>
    </div>
  );
}
