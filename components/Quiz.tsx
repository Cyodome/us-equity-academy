"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { kindLabel, type Question } from "@/lib/quizzes";
import { useProgress } from "./Providers";
import { IconCheck, IconClose } from "./Icons";

// 選択肢の並びを問題ごとに固定のシャッフルにする（正解位置が偏らない）
function shuffled(q: Question) {
  let h = 0;
  for (const ch of q.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const idx = q.choices.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const chLabel = (ch: string) => `第${ch.replace("ch", "")}章`;

export function Quiz({
  questions,
  title,
  onRestart,
  showChapter,
}: {
  questions: Question[];
  title: string;
  onRestart?: () => void;
  showChapter?: boolean;
}) {
  const { answer } = useProgress();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<{ q: Question; ok: boolean }[]>([]);
  const q = questions[i];
  const order = useMemo(() => (q ? shuffled(q) : []), [q]);
  const done = i >= questions.length;

  const choose = useCallback(
    (orig: number) => {
      if (picked !== null || !q) return;
      const ok = orig === q.a;
      setPicked(orig);
      answer(q.id, ok);
      setResults((r) => [...r, { q, ok }]);
    },
    [picked, q, answer]
  );
  const next = useCallback(() => {
    setPicked(null);
    setI((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (picked === null && ["1", "2", "3", "4"].includes(e.key)) {
        const k = Number(e.key) - 1;
        if (order[k] !== undefined) choose(order[k]);
      } else if (picked !== null && (e.key === "Enter" || e.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, order, choose, next]);

  if (!questions.length) {
    return <p className="rounded-xl border border-line bg-surface p-5 text-center text-[0.9rem] text-muted">この条件で出題できる問題はありません。</p>;
  }

  if (done) {
    const score = results.filter((r) => r.ok).length;
    const missed = results.filter((r) => !r.ok);
    const rate = Math.round((score / results.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-[0.8rem] text-muted">{title}の結果</p>
        <p className="serif mt-1 text-4xl font-extrabold tnum text-ink">
          {score}
          <span className="text-xl text-muted"> ／ {results.length}問</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
          <motion.div className="h-full rounded-full" style={{ background: rate >= 80 ? "var(--up)" : rate >= 50 ? "var(--amber)" : "var(--down)" }} initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <p className="mt-3 text-[0.9rem]">
          {rate === 100 ? "全問正解。次の章へ進みましょう。" : rate >= 80 ? "よく理解できています。間違えた問題の解説だけ確認しましょう。" : "解説を読み、該当する節を読み直してから再挑戦しましょう。"}
        </p>
        {missed.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-[0.85rem] font-bold text-ink">間違えた問題</p>
            {missed.map(({ q }) => (
              <div key={q.id} className="rounded-xl bg-surface-2 p-3.5 text-[0.86rem]">
                <p className="font-bold text-ink">{q.q}</p>
                <p className="mt-1">
                  正解：<b className="text-up">{q.choices[q.a]}</b>
                </p>
                <p className="mt-1 text-muted">{q.why}</p>
                <Link href={`/chapters/${q.ch}/`} className="mt-1 inline-block text-[0.8rem] text-blue underline underline-offset-4">
                  {chLabel(q.ch)}を読み直す
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setI(0);
              setPicked(null);
              setResults([]);
              onRestart?.();
            }}
            className="rounded-lg bg-ink px-4 py-2 text-[0.88rem] font-bold text-paper"
          >
            もう一度解く
          </button>
          <Link href="/quiz/" className="rounded-lg border border-line px-4 py-2 text-[0.88rem] text-ink hover:bg-surface-2">
            問題の一覧へ
          </Link>
        </div>
      </motion.div>
    );
  }

  const ok = picked !== null && picked === q.a;
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[0.78rem] font-bold tnum text-ink">
          {i + 1} ／ {questions.length}
        </span>
        <div className="flex flex-1 gap-1" aria-hidden>
          {questions.map((_, k) => (
            <span
              key={k}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background: k < results.length ? (results[k].ok ? "var(--up)" : "var(--down)") : k === i ? "var(--ink)" : "var(--surface-2)",
              }}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.72rem]">
            <span className="rounded-full bg-blue-soft px-2 py-0.5 font-bold text-ink">{kindLabel[q.kind]}</span>
            {showChapter && <span className="text-muted">{chLabel(q.ch)}</span>}
          </div>
          <p className="text-[1.02rem] font-bold leading-relaxed text-ink">{q.q}</p>
          <div className="mt-4 grid gap-2" role="radiogroup" aria-label="選択肢">
            {order.map((orig, k) => {
              const isAns = orig === q.a;
              const isPicked = orig === picked;
              const state = picked === null ? "idle" : isAns ? "right" : isPicked ? "wrong" : "dim";
              return (
                <motion.button
                  key={orig}
                  role="radio"
                  aria-checked={isPicked}
                  disabled={picked !== null}
                  onClick={() => choose(orig)}
                  animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[0.92rem] transition-colors ${
                    state === "idle"
                      ? "border-line hover:border-blue hover:bg-blue-soft"
                      : state === "right"
                        ? "border-up bg-[color-mix(in_oklab,var(--up)_12%,transparent)]"
                        : state === "wrong"
                          ? "border-down bg-down-soft"
                          : "border-line opacity-55"
                  }`}
                >
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[0.7rem] font-bold tnum ${state === "right" ? "border-up bg-up text-white" : state === "wrong" ? "border-down bg-down text-white" : "border-line-strong text-muted"}`}>
                    {state === "right" ? <IconCheck className="h-3.5 w-3.5" /> : state === "wrong" ? <IconClose className="h-3.5 w-3.5" /> : k + 1}
                  </span>
                  <span className="text-text">{q.choices[orig]}</span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <div className={`mt-4 rounded-xl p-3.5 text-[0.88rem] leading-relaxed ${ok ? "bg-[color-mix(in_oklab,var(--up)_10%,transparent)]" : "bg-down-soft"}`}>
                  <p className={`font-bold ${ok ? "text-up" : "text-down"}`}>{ok ? "正解" : `不正解。正解は「${q.choices[q.a]}」`}</p>
                  <p className="mt-1 text-text">{q.why}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="hidden text-[0.72rem] text-muted sm:inline">Enterキーで次へ</span>
                  <button onClick={next} className="ml-auto rounded-lg bg-ink px-4 py-2 text-[0.88rem] font-bold text-paper">
                    {i + 1 === questions.length ? "結果を見る" : "次の問題へ"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {picked === null && <p className="mt-3 hidden text-[0.72rem] text-muted sm:block">1〜4のキーでも回答できます</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
