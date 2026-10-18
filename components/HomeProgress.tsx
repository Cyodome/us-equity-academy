"use client";

import Link from "next/link";
import type { TocItem } from "@/lib/toc-shared";
import { questions } from "@/lib/quizzes";
import { useProgress } from "./Providers";
import { IconCheck } from "./Icons";

export function HomeProgress({ variant, items, total }: { variant: "resume" | "stats" | "list"; items?: TocItem[]; total?: number }) {
  const { store, ready, streak } = useProgress();

  if (variant === "resume") {
    if (!ready || !store.last) return null;
    return (
      <Link href={`/chapters/${store.last}/`} className="rounded-xl border border-white/25 px-5 py-2.5 text-[0.92rem] font-bold text-white hover:bg-white/10">
        続きから読む
      </Link>
    );
  }

  if (variant === "stats") {
    const read = Object.keys(store.read).length;
    const answered = Object.values(store.answers);
    const ok = answered.filter((a) => a.ok).length;
    const wrong = answered.filter((a) => !a.ok).length;
    const stats = [
      { l: "読み終えた章", v: `${read}`, s: `／${total}` },
      { l: "正解した問題", v: `${ok}`, s: `／${questions.length}` },
      { l: "復習が必要な問題", v: `${wrong}`, s: "問" },
      { l: "連続学習", v: `${streak}`, s: "日" },
    ];
    return (
      <section aria-label="学習の記録" className="relative z-10 -mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-4 sm:p-5" style={{ boxShadow: "var(--shadow)" }}>
        {stats.map((x) => (
          <div key={x.l}>
            <p className="text-[0.75rem] text-muted">{x.l}</p>
            <p className="serif mt-0.5 text-[1.7rem] font-extrabold leading-none tnum text-ink">
              {ready ? x.v : "–"}
              <span className="ml-0.5 text-[0.85rem] font-semibold text-muted">{x.s}</span>
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items!.map((t) => {
        const done = !!store.read[t.id];
        const qs = questions.filter((q) => q.ch === t.id);
        const ok = qs.filter((q) => store.answers[q.id]?.ok).length;
        return (
          <li key={t.id}>
            <Link href={`/chapters/${t.id}/`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2">
              <span className="serif w-10 shrink-0 text-center text-[1.1rem] font-extrabold tnum text-muted group-hover:text-amber">
                {t.id === "intro" ? "前提" : t.id === "appendix" ? "付" : t.num}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{t.title}</span>
                <span className="block truncate text-[0.8rem] text-muted">{t.lead}</span>
              </span>
              {qs.length > 0 && <span className="hidden shrink-0 text-[0.75rem] tnum text-muted sm:inline">問題 {ok}/{qs.length}</span>}
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${done ? "border-up bg-up text-white" : "border-line-strong text-transparent"}`} aria-label={done ? "読了" : "未読"}>
                <IconCheck className="h-3 w-3" />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
