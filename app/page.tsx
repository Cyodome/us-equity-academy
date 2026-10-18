import Link from "next/link";
import { getToc, parts } from "@/lib/content";
import { Hero } from "@/components/Hero";
import { HomeProgress } from "@/components/HomeProgress";
import { CompanyCardsLink } from "@/components/CompanyCardsLink";
import { questions } from "@/lib/quizzes";
import { LegacyRedirect } from "@/components/LegacyRedirect";

export default function Home() {
  const toc = getToc();
  return (
    <main id="main">
      <LegacyRedirect />
      <section className="relative overflow-hidden bg-hero text-hero-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(var(--hero-ink) 1px, transparent 1px), linear-gradient(90deg, var(--hero-ink) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 pb-14 pt-12 sm:px-8 md:grid-cols-[1.05fr_1fr] md:items-end md:pb-20 md:pt-20">
          <div>
            <h1 className="serif text-[2.3rem] font-extrabold leading-[1.25] text-white sm:text-[3.1rem]">
              米国株投資
              <br />
              実践教科書
            </h1>
            <p className="mt-5 max-w-[30rem] text-[0.98rem] leading-[1.9] text-hero-ink/80">
              市場の仕組み、財務指標が株価を動かすメカニズム、板と注文の執行、最初の100万円の運用。15章と{questions.length}問の理解チェックで、長期で資産を築くための判断の型を身につける。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/chapters/ch1/" className="rounded-xl bg-amber px-5 py-2.5 text-[0.92rem] font-bold text-[#1b1406] hover:brightness-105">
                第1章から読む
              </Link>
              <HomeProgress variant="resume" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <Hero />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <HomeProgress variant="stats" total={toc.length} />

        <section className="mt-14" aria-labelledby="path">
          <h2 id="path" className="serif text-[1.6rem] font-extrabold text-ink">学習の順番</h2>
          <p className="mt-2 max-w-[44rem] text-[0.92rem] text-muted">
            第I部で市場の仕組みを、第II部で財務指標と株価のつながりを、第III部で口座と注文の執行を学ぶ。順に進むのが基本だが、気になる章から読んでも構わない。
          </p>
          <div className="mt-8 space-y-10">
            {parts.map((p) => (
              <div key={p.num} className="grid gap-4 md:grid-cols-[14rem_1fr]">
                <div>
                  <p className="serif text-[1.05rem] font-extrabold text-amber">{p.roman === "付" ? "付録" : `第${p.roman}部`}</p>
                  <p className="serif mt-1 text-[1.15rem] font-extrabold leading-snug text-ink">{p.title}</p>
                  <p className="mt-1 text-[0.8rem] text-muted">{p.lead}</p>
                </div>
                <HomeProgress variant="list" items={toc.filter((t) => t.part === p.num)} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="ledger">
          <h2 id="ledger" className="serif text-[1.6rem] font-extrabold text-ink">架空3社の数字は、いつでも引き出せる</h2>
          <p className="mt-2 max-w-[44rem] text-[0.92rem] text-muted">
            第II部の計算はすべて同じ3社の財務諸表から始まる。本文の社名をタップするか、画面の「3社の数字」を押すと、損益計算書・キャッシュフロー・貸借対照表がその場で開く。前のページに戻る必要はない。
          </p>
          <div className="mt-6">
            <CompanyCardsLink />
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3" aria-label="問題の解き方">
          {[
            { t: "章末の理解チェック", d: "各章の最後に10問。計算・理解・判断の3種類で、全問に解説がある。", href: "/chapters/ch1/#quiz" },
            { t: "ランダム10問", d: "全章から無作為に10問。読み終えた章の復習に。", href: "/quiz/?mode=random" },
            { t: "弱点復習", d: "一度でも間違えた問題だけを出題する。記録はこの端末に保存される。", href: "/quiz/?mode=review" },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-blue">
              <p className="font-bold text-ink">{x.t}</p>
              <p className="mt-1.5 text-[0.86rem] text-muted">{x.d}</p>
            </Link>
          ))}
        </section>

        <footer className="mb-12 mt-16 border-t border-line pt-6 text-[0.75rem] leading-relaxed text-muted">
          <p>
            本サイトは教育目的の資料であり、特定の金融商品・証券会社の推奨ではありません。株式・ETFは元本割れのリスクがあり、記載した想定利回り・シナリオは保証されません。税制・手数料・証券会社のサービスは変更されることがあるため、最新の公式情報を確認してください。投資判断は自身の責任で行ってください。
          </p>
          <p className="mt-2">市場データ・経済指標は2026年10月16日時点に更新（各章に出典と時点を記載）。学習の記録はこの端末のブラウザにのみ保存されます。</p>
        </footer>
      </div>
    </main>
  );
}
