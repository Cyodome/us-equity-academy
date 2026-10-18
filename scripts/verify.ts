// npm run verify — 本文の数値・問題・図の参照・格言の位置を機械的に検証する
import fs from "node:fs";
import path from "node:path";
import { companies, metrics } from "../lib/companies";
import { questions } from "../lib/quizzes";
import { quotes } from "../lib/quotes";
import { glossary } from "../lib/glossary";
import { getChapters } from "../lib/content";
import { accumulate, annuityFv, dcf, fv, recoveryGain } from "../lib/finance";

let fail = 0;
let pass = 0;
const near = (a: number | null, b: number, tol = 0.051) => a != null && Math.abs(a - b) <= tol;
function check(name: string, ok: boolean, detail = "") {
  if (ok) pass++;
  else {
    fail++;
    console.log(`✗ ${name} ${detail}`);
  }
}

// ── 1. 3社の派生指標が本文の値と一致するか
const A = metrics(companies.apx), N = metrics(companies.nova), I = metrics(companies.irn);
const expect: [string, number | null, number, number?][] = [
  ["APX EPS", A.eps, 8], ["NOVA EPS", N.eps, -1], ["IRN EPS", I.eps, 2.75],
  ["APX PER", A.per, 15], ["IRN PER", I.per, 10.9], ["IRN 益回り", I.earningsYield, 9.17], ["APX 益回り", A.earningsYield, 6.67],
  ["APX ROE", A.roe, 16], ["IRN ROE", I.roe, 13.75], ["NOVA ROE", N.roe, -3.3],
  ["APX ROIC", A.roic, 14.7], ["IRN ROIC", I.roic, 6.7],
  ["APX PBR", A.pbr, 2.4], ["NOVA PBR", N.pbr, 6.67], ["IRN PBR", I.pbr, 1.5],
  ["APX PSR", A.psr, 1.2], ["NOVA PSR", N.psr, 10], ["IRN PSR", I.psr, 1.2],
  ["APX EV/S", A.evSales, 1.3], ["NOVA EV/S", N.evSales, 8.75], ["IRN EV/S", I.evSales, 2.74, 0.01],
  ["APX FCF利回り", A.fcfYield, 7.5], ["NOVA FCF利回り", N.fcfYield, 0.25], ["IRN FCF利回り", I.fcfYield, 4.17],
  ["APX P/FCF", A.pfcf, 13.33], ["NOVA P/FCF", N.pfcf, 400], ["IRN P/FCF", I.pfcf, 24],
  ["APX FCF転換率", A.fcfConversion, 112.5], ["IRN FCF転換率", I.fcfConversion, 45.45],
  ["APX FCF配当性向", A.fcfPayout, 35.56], ["IRN FCF配当性向", I.fcfPayout, 160],
  ["APX 自己資本比率", A.equityRatio, 50], ["NOVA 自己資本比率", N.equityRatio, 75], ["IRN 自己資本比率", I.equityRatio, 26.67],
  ["IRN 純有利子負債/EBITDA", I.netDebtEbitda, 5.13], ["APX 純有利子負債/EBITDA", A.netDebtEbitda, 0.77],
  ["APX カバレッジ", A.coverage, 11], ["IRN カバレッジ", I.coverage, 3.33],
  ["APX 持続可能成長率", A.sustainableGrowth, 9.6], ["IRN 持続可能成長率", I.sustainableGrowth, 3.75],
  ["APX PEG", A.peg, 1.5], ["IRN PEG", I.peg, 3.64],
  ["APX 配当利回り", A.divYield, 2.67], ["IRN 配当利回り", I.divYield, 6.67],
  ["IRN レバレッジ", I.leverage, 3.75], ["IRN 回転率", I.assetTurnover, 0.33], ["NOVA SBC/売上", N.sbcToSales, 15],
  ["APX EV", A.ev, 130], ["NOVA EV", N.ev, 175], ["IRN EV", I.ev, 137],
];
for (const [n, got, want, tol] of expect) check(n, near(got, want, tol ?? 0.051), `got ${got} want ${want}`);

// 財務諸表の内部整合（利益・CF・BSの足し算）
for (const c of Object.values(companies)) {
  const { pl, cf, bs } = c;
  check(`${c.ticker} 粗利`, near(pl.revenue - pl.cogs, pl.gross, 1e-9));
  check(`${c.ticker} 営業利益`, near(pl.gross - pl.sga, pl.op, 1e-9));
  check(`${c.ticker} 税引前`, near(pl.op - pl.interest + pl.other, pl.pretax, 1e-9));
  check(`${c.ticker} 純利益`, near(pl.pretax - pl.tax, pl.net, 1e-9));
  check(`${c.ticker} 営業CF`, near(cf.net + cf.da + cf.sbc + cf.wc, cf.ocf, 1e-9));
  check(`${c.ticker} FCF`, near(cf.ocf + cf.capex, cf.fcf, 1e-9));
  check(`${c.ticker} 負債合計`, near(bs.debt + bs.otherLiab, bs.liab, 1e-9));
  check(`${c.ticker} 総資産`, near(bs.liab + bs.equity, bs.assets, 1e-9));
  check(`${c.ticker} 配当`, near(-cf.div, c.share.dps * c.share.shares, 1e-9));
}

// ── 2. 本文の計算例
const d = dcf({ fcf0: 9, growth: 0.08, years: 5, r: 0.09, g: 0.03, netDebt: 10, shares: 1 });
check("DCF 理論株価 $181", near(d.price, 181.3, 0.1), `${d.price}`);
check("DCF TV 227.0", near(d.tv, 227.0, 0.05), `${d.tv}`);
check("DCF TV比率 77%", near(d.tvShare, 77.1, 0.1));
const grid: [number, number, number][] = [[8, 2, 188], [8, 3, 220], [9, 2, 159], [9, 3, 181], [10, 2, 137], [10, 3, 153], [11, 2, 120], [11, 3, 133]];
for (const [r, g, p] of grid) check(`DCF感応度 r${r} g${g}`, Math.round(dcf({ fcf0: 9, growth: 0.08, years: 5, r: r / 100, g: g / 100, netDebt: 10, shares: 1 }).price) === p);
check("複利 7% 30年", Math.round(fv(10000, 0.07, 30)) === 76123);
check("複利 10% 30年", Math.round(fv(10000, 0.1, 30)) === 174494);
check("複利 10% 40年", Math.round(fv(10000, 0.1, 40)) === 452593);
check("積立 7% 30年", near(annuityFv(6000, 0.07, 30), 566765, 1));
check("積立 10% 30年", near(annuityFv(6000, 0.1, 30), 986964, 1));
check("コスト1% 30年", Math.round(fv(10000, 0.06, 30)) === 57435);
check("コスト1.5% 30年", Math.round(fv(10000, 0.055, 30)) === 49840);
check("回復 78%", near(recoveryGain(0.78) * 100, 354.5, 0.1));
check("回復 50%", near(recoveryGain(0.5) * 100, 100, 1e-9));
check("ボラティリティ C", Math.round(10000 * 1.5 * 0.66) === 9900);
check("ボラティリティ B", Math.round(10000 * 1.3 * 0.86) === 11180);
const acc = accumulate(100, 10, 0.07, 30);
check("積立シミュ 7% 30年 1億3,011万", Math.round(acc[30].value) === 13011);
check("積立シミュ 5% 20年 4,382万", Math.round(accumulate(100, 10, 0.05, 30)[20].value) === 4382);
check("営業レバレッジ +10%", near(((110 * 0.35 - 24 - 1) * 0.8) / 8 - 1, 0.35, 1e-9));
check("自社株買い EPS", near(8 / (1 - 5 / 120), 8.35, 0.005));
check("Nova ベース $179", Math.round((20 * 1.25 ** 5 * 0.15 * 25) / 1.05 ** 5) === 179);
check("Nova 要求CAGR 32.7%", near(((200 * 1.1 ** 5 * 1.05 ** 5) / 25 / 0.2 / 20) ** 0.2 * 100 - 100, 32.7, 0.1));
check("為替 +10% 円高", near((1.1 * 140) / 156 * 100 - 100, -1.28, 0.01));
check("配当手取り", near(100 * 0.9 * (1 - 0.20315), 71.72, 0.005));
check("Apex 10年後配当", near(3.2 * 1.1 ** 10, 8.3, 0.01));
check("VOO 6株", Math.floor(500000 / 156 / 500) === 6);
check("トレーリング $153", 180 * 0.85 === 153);
check("ポジション5株", Math.floor(100 / 18) === 5);

// ── 3. 問題
const chapters = getChapters();
const chIds = new Set(chapters.map((c) => c.id));
const ids = new Set<string>();
for (const q of questions) {
  check(`問題 ${q.id} 重複なし`, !ids.has(q.id));
  ids.add(q.id);
  check(`問題 ${q.id} 選択肢4つ`, q.choices.length === 4);
  check(`問題 ${q.id} 正解位置`, q.a >= 0 && q.a < q.choices.length);
  check(`問題 ${q.id} 章が存在`, chIds.has(q.ch));
  check(`問題 ${q.id} 選択肢の重複なし`, new Set(q.choices).size === q.choices.length);
  check(`問題 ${q.id} 解説あり`, q.why.length > 10);
}
check("問題数 150", questions.length === 150, `${questions.length}`);
for (let n = 1; n <= 15; n++) check(`第${n}章 10問`, questions.filter((q) => q.ch === `ch${n}`).length === 10);

// ── 4. 図・格言・用語集の参照
const registrySrc = fs.readFileSync(path.join(process.cwd(), "components/charts/index.tsx"), "utf8");
for (const c of chapters) {
  const all = [c.preamble, ...c.sections.map((s) => s.body)].join("\n");
  for (const m of all.matchAll(/\{\{chart:(\w+)\}\}/g)) check(`図 ${m[1]}（${c.id}）`, registrySrc.includes(`${m[1]}:`));
  check(`${c.id} 画像タグなし`, !all.includes("<img") && !all.includes("<figure"));
}
for (const q of quotes) {
  const c = chapters.find((x) => x.id === q.chapter);
  check(`格言 ${q.chapter} ${q.after}`, !!c?.sections.some((s) => s.id === `s${q.after}`));
}
for (const t of glossary) if (t.ch) check(`用語 ${t.term} の章`, chIds.has(t.ch));

// ── 5. 個人情報が成果物に含まれていないか
const banned = [/akanuma/i, /赤沼/, /拓海/, /takumi/i, /表示灯/, /navita/i, /ナビタ/];
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (["node_modules", ".next", "out", ".git"].includes(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
for (const f of walk(process.cwd())) {
  if (!/\.(ts|tsx|md|css|json|mjs|svg|txt)$/.test(f) || f.endsWith("package-lock.json")) continue;
  const src = fs.readFileSync(f, "utf8");
  for (const b of banned) if (f.endsWith("verify.ts")) continue; else check(`個人情報なし ${path.relative(process.cwd(), f)} ${b}`, !b.test(src));
}

console.log(`\n検証：${pass}件合格、${fail}件不合格`);
process.exit(fail ? 1 : 0);
