import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizHub } from "@/components/QuizHub";
import { getToc } from "@/lib/content";

export const metadata: Metadata = { title: "問題", description: "全150問の理解チェック。章別・ランダム・弱点復習で出題。" };

export default function QuizPage() {
  const toc = getToc().filter((t) => t.id.startsWith("ch"));
  return (
    <main id="main" className="mx-auto max-w-[56rem] px-4 py-10 sm:px-6">
      <h1 className="serif text-[2rem] font-extrabold text-ink">問題</h1>
      <p className="mt-2 text-[0.92rem] text-muted">各章10問、全150問。計算・理解・判断の3種類で、全問に解説があります。結果はこの端末のブラウザに記録されます。</p>
      <Suspense>
        <QuizHub toc={toc.map((t) => ({ id: t.id, num: t.num, title: t.title }))} />
      </Suspense>
    </main>
  );
}
