"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { questions, type Question } from "@/lib/quizzes";
import { Quiz } from "./Quiz";
import { useProgress } from "./Providers";

type Mode = "random" | "review" | "all" | `ch${number}`;

function shuffle<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function QuizHub({ toc }: { toc: { id: string; num: number; title: string }[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const { store, ready, reset } = useProgress();
  const mode = (sp.get("mode") as Mode | null) ?? null;
  const [round, setRound] = useState(0);

  const set = (m: Mode | null) => {
    setRound((r) => r + 1);
    router.push(m ? `/quiz/?mode=${m}` : "/quiz/", { scroll: false });
  };

  const wrongIds = useMemo(() => Object.entries(store.answers).filter(([, a]) => !a.ok).map(([id]) => id), [store.answers]);

  const qs: Question[] = useMemo(() => {
    if (!mode) return [];
    if (mode === "random") return shuffle(questions).slice(0, 10);
    if (mode === "all") return shuffle(questions);
    if (mode === "review") return shuffle(questions.filter((q) => wrongIds.includes(q.id)));
    return questions.filter((q) => q.ch === mode);
    // round を変えると出題を作り直す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, round, ready]);

  const title = mode === "random" ? "ランダム10問" : mode === "all" ? "全150問" : mode === "review" ? "弱点復習" : mode ? `第${mode.replace("ch", "")}章` : "";

  if (mode) {
    return (
      <div className="mt-8">
        <button onClick={() => set(null)} className="mb-4 text-[0.85rem] text-blue underline underline-offset-4">
          ← 問題の一覧へ戻る
        </button>
        <p className="serif mb-3 text-[1.3rem] font-extrabold text-ink">{title}</p>
        {mode === "review" && ready && qs.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-5 text-[0.9rem]">
            復習が必要な問題はありません。章末の問題やランダム10問に挑戦すると、間違えた問題がここに集まります。
          </p>
        ) : (
          <Quiz key={`${mode}-${round}`} questions={qs} title={title} showChapter={!mode.startsWith("ch")} onRestart={() => setRound((r) => r + 1)} />
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { m: "random" as Mode, t: "ランダム10問", d: "全章から無作為に10問" },
          { m: "review" as Mode, t: `弱点復習（${ready ? wrongIds.length : "–"}問）`, d: "間違えた問題だけを出題" },
          { m: "all" as Mode, t: "全150問に挑戦", d: "順番を混ぜて全問を出題" },
        ].map((x) => (
          <button key={x.m} onClick={() => set(x.m)} className="rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-blue">
            <span className="block font-bold text-ink">{x.t}</span>
            <span className="mt-1 block text-[0.82rem] text-muted">{x.d}</span>
          </button>
        ))}
      </div>

      <section>
        <h2 className="serif mb-3 text-[1.25rem] font-extrabold text-ink">章別に解く</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {toc.map((t) => {
            const qs = questions.filter((q) => q.ch === t.id);
            const tried = qs.filter((q) => store.answers[q.id]);
            const ok = qs.filter((q) => store.answers[q.id]?.ok).length;
            const rate = qs.length ? ok / qs.length : 0;
            return (
              <li key={t.id}>
                <button onClick={() => set(t.id as Mode)} className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-surface-2">
                  <span className="serif text-[1.05rem] font-extrabold tnum text-muted">{t.num}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-ink">{t.title}</span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-up transition-all" style={{ width: `${rate * 100}%` }} />
                    </span>
                  </span>
                  <span className="text-right text-[0.78rem] tnum text-muted">
                    {ready ? `${ok}/${qs.length}` : "–"}
                    {ready && tried.length > ok && <span className="block text-down">要復習 {tried.length - ok}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="text-right">
        <button
          onClick={() => {
            if (window.confirm("学習の記録（読了・問題の結果）をすべて消去します。元に戻せません。よろしいですか？")) reset();
          }}
          className="text-[0.78rem] text-muted underline underline-offset-4 hover:text-down"
        >
          学習の記録を消去する
        </button>
      </div>
    </div>
  );
}
