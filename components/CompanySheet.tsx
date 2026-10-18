"use client";

import { companies, companyOrder, fmtValue, rowDefs, type Company, type CompanyId } from "@/lib/companies";
import type { DrawerTab } from "./Providers";

type Row = { label: string; get: (c: Company) => number | null; fmt?: "oku" | "pct" | "usd" | "x" | "ratio" | "okukabu"; strong?: boolean; sub?: boolean };

const pct = (c: Company, v: number) => (v / c.pl.revenue) * 100;

export const sheets: Record<DrawerTab, { title: string; unit: string; rows: Row[] }> = {
  pl: {
    title: "損益計算書（年間）",
    unit: "億ドル",
    rows: [
      { label: "売上高", get: (c) => c.pl.revenue, strong: true },
      { label: "売上高成長率", get: (c) => c.pl.growth, fmt: "pct", sub: true },
      { label: "売上原価", get: (c) => c.pl.cogs },
      { label: "売上総利益（粗利）", get: (c) => c.pl.gross },
      { label: "粗利率", get: (c) => pct(c, c.pl.gross), fmt: "pct", sub: true },
      { label: "販管費・研究開発費", get: (c) => c.pl.sga },
      { label: "営業利益", get: (c) => c.pl.op, strong: true },
      { label: "営業利益率", get: (c) => pct(c, c.pl.op), fmt: "pct", sub: true },
      { label: "支払利息", get: (c) => c.pl.interest },
      { label: "その他損益", get: (c) => c.pl.other },
      { label: "税引前利益", get: (c) => c.pl.pretax },
      { label: "法人税", get: (c) => c.pl.tax },
      { label: "純利益", get: (c) => c.pl.net, strong: true },
      { label: "純利益率", get: (c) => pct(c, c.pl.net), fmt: "pct", sub: true },
      { label: "減価償却費（D&A）", get: (c) => c.pl.da },
      { label: "株式報酬費用（SBC）", get: (c) => c.pl.sbc },
      { label: "EBITDA（営業利益＋D&A）", get: (c) => c.pl.op + c.pl.da },
    ],
  },
  cf: {
    title: "キャッシュフロー計算書（年間）",
    unit: "億ドル",
    rows: [
      { label: "純利益", get: (c) => c.cf.net },
      { label: "＋減価償却費", get: (c) => c.cf.da },
      { label: "＋株式報酬費用（非現金）", get: (c) => c.cf.sbc },
      { label: "±運転資本の増減", get: (c) => c.cf.wc },
      { label: "営業キャッシュフロー", get: (c) => c.cf.ocf, strong: true },
      { label: "設備投資（CapEx）", get: (c) => c.cf.capex },
      { label: "フリーキャッシュフロー（FCF）", get: (c) => c.cf.fcf, strong: true },
      { label: "配当支払", get: (c) => c.cf.div },
      { label: "自社株買い", get: (c) => c.cf.buyback },
      { label: "有利子負債の純増減", get: (c) => c.cf.debtChange },
    ],
  },
  bs: {
    title: "貸借対照表（期末）と株式情報",
    unit: "億ドル",
    rows: [
      { label: "現金・同等物", get: (c) => c.bs.cash },
      { label: "総資産", get: (c) => c.bs.assets, strong: true },
      { label: "有利子負債", get: (c) => c.bs.debt },
      { label: "その他負債", get: (c) => c.bs.otherLiab },
      { label: "負債合計", get: (c) => c.bs.liab },
      { label: "自己資本（株主資本）", get: (c) => c.bs.equity, strong: true },
      { label: "純有利子負債（負債－現金）", get: (c) => c.bs.debt - c.bs.cash },
      { label: "発行済株式数", get: (c) => c.share.shares, fmt: "okukabu" },
      { label: "株価", get: (c) => c.share.price, fmt: "usd", strong: true },
      { label: "時価総額", get: (c) => c.share.price * c.share.shares },
      { label: "企業価値（EV）", get: (c) => c.share.price * c.share.shares + c.bs.debt - c.bs.cash },
      { label: "年間配当（1株）", get: (c) => c.share.dps, fmt: "usd" },
      { label: "今後5年のEPS成長率（予想）", get: (c) => c.share.epsGrowth, fmt: "pct" },
      { label: "想定税率", get: (c) => c.share.taxRate, fmt: "pct" },
    ],
  },
  metrics: {
    title: "主要指標（本文の計算結果）",
    unit: "",
    rows: [
      "eps", "per", "earningsYield", "peg", "pbr", "roe", "roic", "wacc", "sustainableGrowth", "psr", "evSales",
      "fcfConversion", "fcfYield", "pfcf", "divYield", "fcfPayout", "equityRatio", "netDebtEbitda", "coverage", "sbcToSales",
    ].map((k) => ({ label: rowDefs[k].label, get: rowDefs[k].get, fmt: rowDefs[k].fmt as Row["fmt"] })),
  },
};

export function SheetTable({ tab, highlight, compact }: { tab: DrawerTab; highlight?: CompanyId | "all"; compact?: boolean }) {
  const sheet = sheets[tab];
  return (
    <div className="table-wrap">
      <table className={compact ? "text-[0.8rem]" : ""}>
        <caption className="sr-only">{sheet.title}</caption>
        <thead>
          <tr>
            <th scope="col">{sheet.unit ? `項目（${sheet.unit}）` : "指標"}</th>
            {companyOrder.map((id) => (
              <th
                key={id}
                scope="col"
                style={{ textAlign: "right", color: companies[id].color }}
                className={highlight === id ? "!bg-blue-soft" : ""}
              >
                {companies[id].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sheet.rows.map((r) => (
            <tr key={r.label}>
              <th
                scope="row"
                className={`!bg-transparent !border-0 !font-normal ${r.strong ? "!font-bold text-ink" : ""} ${r.sub ? "!pl-6 text-muted" : ""}`}
                style={{ whiteSpace: "normal" }}
              >
                {r.label}
              </th>
              {companyOrder.map((id) => {
                const v = r.get(companies[id]);
                return (
                  <td
                    key={id}
                    style={{ textAlign: "right" }}
                    className={`tnum ${r.strong ? "font-bold" : ""} ${v != null && v < 0 ? "text-down" : r.strong ? "text-ink" : r.sub ? "text-muted" : ""} ${highlight === id ? "bg-blue-soft/60" : ""}`}
                  >
                    {fmtValue(v, r.fmt ?? "oku")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 第II部の前提ページに埋め込む全表
export function CompanySheet() {
  return (
    <div className="not-prose space-y-8">
      <CompanyCards />
      {(["pl", "cf", "bs", "metrics"] as DrawerTab[]).map((t) => (
        <section key={t} className="space-y-2">
          <h4 className="serif text-[1.05rem] font-extrabold text-ink">{sheets[t].title}</h4>
          <SheetTable tab={t} />
        </section>
      ))}
    </div>
  );
}

export function CompanyCards({ onPick }: { onPick?: (id: CompanyId) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {companyOrder.map((id) => {
        const c = companies[id];
        const Tag = onPick ? "button" : "div";
        return (
          <Tag
            key={id}
            onClick={onPick ? () => onPick(id) : undefined}
            className="relative overflow-hidden rounded-xl border border-line bg-surface p-3.5 text-left"
            style={{ boxShadow: `inset 3px 0 0 ${c.mark}` }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-ink">{c.name}</span>
              <span className="text-[0.72rem] font-bold tnum" style={{ color: c.color }}>
                {c.ticker}
              </span>
            </div>
            <p className="mt-0.5 text-[0.78rem] text-muted">{c.profile}</p>
            <p className="mt-2 text-[0.8rem] tnum text-text">
              株価 ${c.share.price.toFixed(2)}・売上 {c.pl.revenue.toFixed(1)}億・純利益 {fmtValue(c.pl.net, "oku")}億
            </p>
          </Tag>
        );
      })}
    </div>
  );
}
