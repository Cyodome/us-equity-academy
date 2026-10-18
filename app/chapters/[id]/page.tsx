import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { chapterLabel, getChapter, getChapters, getToc, parts } from "@/lib/content";
import { quotesFor } from "@/lib/quotes";
import { questionsFor } from "@/lib/quizzes";
import { Markdown } from "@/components/Markdown";
import { QuoteBlock } from "@/components/QuoteBlock";
import { ChapterShell } from "@/components/ChapterShell";
import { LedgerInline } from "@/components/LedgerRail";
import { ChapterQuiz } from "@/components/ChapterQuiz";
import { IconArrowL, IconArrowR } from "@/components/Icons";

export function generateStaticParams() {
  return getChapters().map((c) => ({ id: c.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getChapter(id);
  if (!c) return {};
  return { title: `${chapterLabel(c)} ${c.title}`, description: c.lead };
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chapter = getChapter(id);
  if (!chapter) notFound();
  const all = getChapters();
  const idx = all.findIndex((c) => c.id === id);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const part = parts.find((p) => p.num === chapter.part)!;
  const qs = quotesFor(id);
  const quiz = questionsFor(id);
  const chars = chapter.sections.reduce((n, s) => n + s.body.length, chapter.preamble.length);
  const minutes = Math.max(3, Math.round(chars / 650));

  return (
    <ChapterShell toc={getToc()} chapterId={id}>
      <article className="mx-auto max-w-[46rem]">
        <header className="mb-8">
          <p className="text-[0.78rem] text-muted">
            <span className="serif font-extrabold text-amber">{part.roman === "付" ? "付録" : `第${part.roman}部`}</span>
            {part.roman !== "付" && <span className="ml-2">{part.title}</span>}
          </p>
          <h1 className="serif mt-3 text-[1.9rem] font-extrabold leading-[1.35] text-ink sm:text-[2.3rem]">
            <span className="mb-1 block text-[0.95rem] font-semibold text-muted">{chapterLabel(chapter)}</span>
            {chapter.title}
          </h1>
          {chapter.subtitle && <p className="serif mt-1 text-[1.15rem] font-semibold text-text">{chapter.subtitle}</p>}
          <p className="mt-4 text-[0.88rem] text-muted">
            {chapter.lead}
            <span className="mx-2 text-line-strong">|</span>
            読了の目安 約{minutes}分
            {quiz.length > 0 && (
              <>
                <span className="mx-2 text-line-strong">|</span>
                <a href="#quiz" className="text-blue underline underline-offset-4">章末の問題 {quiz.length}問</a>
              </>
            )}
          </p>
        </header>

        <div className="mb-8">
          <LedgerInline chapter={id} />
        </div>

        {chapter.preamble && (
          <div className="mb-10">
            <Markdown source={chapter.preamble} />
          </div>
        )}

        {chapter.sections.map((s, i) => (
          <div key={s.id} className={i === 0 ? "" : "mt-16"}>
            <section id={s.id} data-sec className="scroll-mt-20">
              <h2 className="serif mb-5 flex items-baseline gap-3 border-b border-line pb-3 text-[1.4rem] font-extrabold leading-snug text-ink">
                {s.num && <span className="shrink-0 text-[1rem] text-amber tnum">{s.num}</span>}
                <span>{s.title}</span>
              </h2>
              <Markdown source={s.body} />
            </section>
            {qs.filter((q) => `s${q.after}` === s.id).map((q) => (
              <QuoteBlock key={q.en} q={q} />
            ))}
          </div>
        ))}

        {quiz.length > 0 && (
          <section id="quiz" className="mt-16 scroll-mt-20">
            <h2 className="serif mb-2 text-[1.4rem] font-extrabold text-ink">理解チェック</h2>
            <p className="mb-5 text-[0.88rem] text-muted">この章の内容から{quiz.length}問。結果はこの端末のブラウザに記録され、間違えた問題は「弱点復習」で出題されます。</p>
            <ChapterQuiz chapterId={id} />
          </section>
        )}

        <nav className="mt-16 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="前後の章">
          {prev ? (
            <Link href={`/chapters/${prev.id}/`} className="group rounded-xl border border-line bg-surface p-4 hover:border-blue">
              <span className="flex items-center gap-1 text-[0.75rem] text-muted"><IconArrowL className="h-3.5 w-3.5" /> 前へ</span>
              <span className="mt-1 block text-[0.92rem] font-bold text-ink">{chapterLabel(prev)}　{prev.title}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link href={`/chapters/${next.id}/`} className="group rounded-xl border border-line bg-surface p-4 text-right hover:border-blue">
              <span className="flex items-center justify-end gap-1 text-[0.75rem] text-muted">次へ <IconArrowR className="h-3.5 w-3.5" /></span>
              <span className="mt-1 block text-[0.92rem] font-bold text-ink">{chapterLabel(next)}　{next.title}</span>
            </Link>
          )}
        </nav>
        <p className="mt-10 text-[0.72rem] leading-relaxed text-muted">
          本書は教育目的の資料であり、特定の金融商品・証券会社の推奨ではありません。株式・ETFは元本割れのリスクがあり、記載した想定利回り・シナリオは保証されません。投資判断は自身の責任で行ってください。
        </p>
      </article>
    </ChapterShell>
  );
}
