// 架空企業3社の財務データ（第II部共通）。本文・右レール・ドロワー・問題はすべてこのデータを参照する。
export type CompanyId = "apx" | "nova" | "irn";

export type Company = {
  id: CompanyId;
  name: string;
  ticker: string;
  profile: string;
  color: string; // 文字用の色
  mark: string; // グラフ・印の色
  pl: Record<PlKey, number>;
  cf: Record<CfKey, number>;
  bs: Record<BsKey, number>;
  share: {
    shares: number; // 億株
    price: number; // $
    dps: number; // 1株配当 $
    epsGrowth: number | null; // 年率 %
    taxRate: number | null; // %
    wacc: number | null; // %
  };
};

export type PlKey =
  | "revenue" | "growth" | "cogs" | "gross" | "sga" | "op" | "interest" | "other"
  | "pretax" | "tax" | "net" | "da" | "sbc";
export type CfKey = "net" | "da" | "sbc" | "wc" | "ocf" | "capex" | "fcf" | "div" | "buyback" | "debtChange";
export type BsKey = "cash" | "assets" | "debt" | "otherLiab" | "liab" | "equity";

export const companies: Record<CompanyId, Company> = {
  apx: {
    id: "apx",
    name: "Apex Retail",
    ticker: "APX",
    profile: "成熟した優良小売",
    color: "var(--co-apx-ink)",
    mark: "var(--co-apx)",
    pl: { revenue: 100, growth: 6, cogs: 65, gross: 35, sga: 24, op: 11, interest: 1, other: 0, pretax: 10, tax: 2, net: 8, da: 2, sbc: 0.3 },
    cf: { net: 8, da: 2, sbc: 0.3, wc: 1.7, ocf: 12, capex: -3, fcf: 9, div: -3.2, buyback: -5, debtChange: -0.8 },
    bs: { cash: 10, assets: 100, debt: 20, otherLiab: 30, liab: 50, equity: 50 },
    share: { shares: 1, price: 120, dps: 3.2, epsGrowth: 10, taxRate: 20, wacc: 9 },
  },
  nova: {
    id: "nova",
    name: "Nova Cloud",
    ticker: "NOVA",
    profile: "赤字の高成長クラウド",
    color: "var(--co-nova-ink)",
    mark: "var(--co-nova)",
    pl: { revenue: 20, growth: 40, cogs: 5, gross: 15, sga: 17, op: -2, interest: 0, other: 0.8, pretax: -1.2, tax: -0.2, net: -1, da: 0.5, sbc: 3 },
    cf: { net: -1, da: 0.5, sbc: 3, wc: -1.5, ocf: 1, capex: -0.5, fcf: 0.5, div: 0, buyback: 0, debtChange: 0 },
    bs: { cash: 25, assets: 40, debt: 0, otherLiab: 10, liab: 10, equity: 30 },
    share: { shares: 1, price: 200, dps: 0, epsGrowth: null, taxRate: null, wacc: null },
  },
  irn: {
    id: "irn",
    name: "Ironclad Power",
    ticker: "IRN",
    profile: "高配当・高レバレッジの電力",
    color: "var(--co-irn-ink)",
    mark: "var(--co-irn)",
    pl: { revenue: 50, growth: 2, cogs: 25, gross: 25, sga: 15, op: 10, interest: 3, other: 0, pretax: 7, tax: 1.5, net: 5.5, da: 5, sbc: 0.1 },
    cf: { net: 5.5, da: 5, sbc: 0.1, wc: -0.1, ocf: 10.5, capex: -8, fcf: 2.5, div: -4, buyback: 0, debtChange: 1.5 },
    bs: { cash: 3, assets: 150, debt: 80, otherLiab: 30, liab: 110, equity: 40 },
    share: { shares: 2, price: 30, dps: 2, epsGrowth: 3, taxRate: 21.4, wacc: 7 },
  },
};

export const companyOrder: CompanyId[] = ["apx", "nova", "irn"];

// 派生指標（本文の値と一致することを scripts/verify.ts で検証する）
export function metrics(c: Company) {
  const { pl, cf, bs, share } = c;
  const eps = pl.net / share.shares;
  const mcap = share.price * share.shares;
  const netDebt = bs.debt - bs.cash;
  const ev = mcap + netDebt;
  const ebitda = pl.op + pl.da;
  const profitable = pl.net > 0;
  const tax = share.taxRate ?? 0;
  const nopat = pl.op * (1 - tax / 100);
  const investedCapital = bs.debt + bs.equity - bs.cash;
  return {
    eps,
    mcap,
    netDebt,
    ev,
    ebitda,
    bps: bs.equity / share.shares,
    per: profitable ? share.price / eps : null,
    earningsYield: profitable ? (eps / share.price) * 100 : null,
    pbr: mcap / bs.equity,
    psr: mcap / pl.revenue,
    evSales: ev / pl.revenue,
    roe: (pl.net / bs.equity) * 100,
    netMargin: (pl.net / pl.revenue) * 100,
    grossMargin: (pl.gross / pl.revenue) * 100,
    opMargin: (pl.op / pl.revenue) * 100,
    assetTurnover: pl.revenue / bs.assets,
    leverage: bs.assets / bs.equity,
    roic: share.taxRate != null && pl.op > 0 ? (nopat / investedCapital) * 100 : null,
    nopat,
    investedCapital,
    fcfMargin: (cf.fcf / pl.revenue) * 100,
    fcfConversion: profitable ? (cf.fcf / pl.net) * 100 : null,
    fcfYield: (cf.fcf / mcap) * 100,
    pfcf: mcap / cf.fcf,
    divYield: (share.dps / share.price) * 100,
    payout: profitable ? (share.dps / eps) * 100 : null,
    fcfPayout: share.dps > 0 ? ((share.dps * share.shares) / cf.fcf) * 100 : null,
    equityRatio: (bs.equity / bs.assets) * 100,
    de: bs.debt / bs.equity,
    netDebtEbitda: netDebt > 0 && ebitda > 0 ? netDebt / ebitda : null,
    coverage: pl.interest > 0 ? pl.op / pl.interest : null,
    sbcToSales: (pl.sbc / pl.revenue) * 100,
    peg: profitable && share.epsGrowth ? share.price / eps / share.epsGrowth : null,
    sustainableGrowth: profitable ? ((pl.net / bs.equity) * (1 - share.dps / eps)) * 100 : null,
  };
}

export type MetricKey = keyof ReturnType<typeof metrics>;

// 表示用のラベル・書式
type Fmt = "usd" | "oku" | "pct" | "x" | "ratio" | "okukabu";
export const rowDefs: Record<string, { label: string; fmt: Fmt; get: (c: Company) => number | null; note?: string }> = {
  revenue: { label: "売上高", fmt: "oku", get: (c) => c.pl.revenue },
  growth: { label: "売上成長率", fmt: "pct", get: (c) => c.pl.growth },
  gross: { label: "売上総利益（粗利）", fmt: "oku", get: (c) => c.pl.gross },
  grossMargin: { label: "粗利率", fmt: "pct", get: (c) => metrics(c).grossMargin },
  sga: { label: "販管費・研究開発費", fmt: "oku", get: (c) => c.pl.sga },
  op: { label: "営業利益", fmt: "oku", get: (c) => c.pl.op },
  opMargin: { label: "営業利益率", fmt: "pct", get: (c) => metrics(c).opMargin },
  interest: { label: "支払利息", fmt: "oku", get: (c) => c.pl.interest },
  net: { label: "純利益", fmt: "oku", get: (c) => c.pl.net },
  netMargin: { label: "純利益率", fmt: "pct", get: (c) => metrics(c).netMargin },
  da: { label: "減価償却費", fmt: "oku", get: (c) => c.pl.da },
  sbc: { label: "株式報酬費用（SBC）", fmt: "oku", get: (c) => c.pl.sbc },
  ebitda: { label: "EBITDA", fmt: "oku", get: (c) => metrics(c).ebitda },
  ocf: { label: "営業CF", fmt: "oku", get: (c) => c.cf.ocf },
  capex: { label: "設備投資", fmt: "oku", get: (c) => c.cf.capex },
  fcf: { label: "FCF", fmt: "oku", get: (c) => c.cf.fcf },
  divTotal: { label: "配当総額", fmt: "oku", get: (c) => c.share.dps * c.share.shares },
  buyback: { label: "自社株買い", fmt: "oku", get: (c) => -c.cf.buyback },
  cash: { label: "現金・同等物", fmt: "oku", get: (c) => c.bs.cash },
  assets: { label: "総資産", fmt: "oku", get: (c) => c.bs.assets },
  debt: { label: "有利子負債", fmt: "oku", get: (c) => c.bs.debt },
  equity: { label: "自己資本", fmt: "oku", get: (c) => c.bs.equity },
  netDebt: { label: "純有利子負債", fmt: "oku", get: (c) => metrics(c).netDebt },
  shares: { label: "発行済株式数", fmt: "okukabu", get: (c) => c.share.shares },
  price: { label: "株価", fmt: "usd", get: (c) => c.share.price },
  mcap: { label: "時価総額", fmt: "oku", get: (c) => metrics(c).mcap },
  ev: { label: "企業価値（EV）", fmt: "oku", get: (c) => metrics(c).ev },
  eps: { label: "EPS", fmt: "usd", get: (c) => metrics(c).eps },
  dps: { label: "1株配当", fmt: "usd", get: (c) => c.share.dps },
  bps: { label: "BPS", fmt: "usd", get: (c) => metrics(c).bps },
  per: { label: "PER", fmt: "x", get: (c) => metrics(c).per },
  earningsYield: { label: "益回り", fmt: "pct", get: (c) => metrics(c).earningsYield },
  epsGrowth: { label: "EPS成長率（予想）", fmt: "pct", get: (c) => c.share.epsGrowth },
  peg: { label: "PEG", fmt: "ratio", get: (c) => metrics(c).peg },
  pbr: { label: "PBR", fmt: "x", get: (c) => metrics(c).pbr },
  roe: { label: "ROE", fmt: "pct", get: (c) => metrics(c).roe },
  assetTurnover: { label: "総資産回転率", fmt: "ratio", get: (c) => metrics(c).assetTurnover },
  leverage: { label: "財務レバレッジ", fmt: "ratio", get: (c) => metrics(c).leverage },
  roic: { label: "ROIC", fmt: "pct", get: (c) => metrics(c).roic },
  wacc: { label: "WACC（仮定）", fmt: "pct", get: (c) => c.share.wacc },
  sustainableGrowth: { label: "持続可能成長率", fmt: "pct", get: (c) => metrics(c).sustainableGrowth },
  psr: { label: "PSR", fmt: "x", get: (c) => metrics(c).psr },
  evSales: { label: "EV/Sales", fmt: "x", get: (c) => metrics(c).evSales },
  fcfMargin: { label: "FCFマージン", fmt: "pct", get: (c) => metrics(c).fcfMargin },
  fcfConversion: { label: "FCF転換率", fmt: "pct", get: (c) => metrics(c).fcfConversion },
  fcfYield: { label: "FCF利回り", fmt: "pct", get: (c) => metrics(c).fcfYield },
  pfcf: { label: "P/FCF", fmt: "x", get: (c) => metrics(c).pfcf },
  divYield: { label: "配当利回り", fmt: "pct", get: (c) => metrics(c).divYield },
  payout: { label: "配当性向", fmt: "pct", get: (c) => metrics(c).payout },
  fcfPayout: { label: "FCFベース配当性向", fmt: "pct", get: (c) => metrics(c).fcfPayout },
  sbcToSales: { label: "SBC ÷ 売上高", fmt: "pct", get: (c) => metrics(c).sbcToSales },
  equityRatio: { label: "自己資本比率", fmt: "pct", get: (c) => metrics(c).equityRatio },
  de: { label: "D/Eレシオ", fmt: "ratio", get: (c) => metrics(c).de },
  netDebtEbitda: { label: "純有利子負債/EBITDA", fmt: "x", get: (c) => metrics(c).netDebtEbitda },
  coverage: { label: "インタレスト・カバレッジ", fmt: "x", get: (c) => metrics(c).coverage },
};

const nf = (v: number, d: number) =>
  v.toLocaleString("ja-JP", { minimumFractionDigits: d, maximumFractionDigits: d });

function trim(a: number, maxD: number) {
  const r = Math.round(a * 10 ** maxD) / 10 ** maxD;
  let d = maxD;
  while (d > 0 && Math.abs(r * 10 ** (d - 1) - Math.round(r * 10 ** (d - 1))) < 1e-9) d--;
  return nf(r, d);
}

export function fmtValue(v: number | null, fmt: Fmt): string {
  if (v == null || !isFinite(v)) return "―";
  const neg = v < 0;
  const a = Math.abs(v);
  let s: string;
  switch (fmt) {
    case "usd": s = "$" + nf(a, 2); break;
    case "oku": s = nf(a, 1); break;
    case "okukabu": s = nf(a, 2) + "億株"; break;
    case "pct": s = trim(a, a >= 10 ? 1 : 2) + "%"; break;
    case "x": s = (a >= 100 ? nf(a, 0) : trim(a, a < 10 ? 2 : 1)) + "x"; break;
    case "ratio": s = nf(a, 2); break;
  }
  return (neg ? "▲" : "") + s;
}

// 章ごとに右レールへ出す数字
export const chapterRail: Record<string, { rows: string[]; note?: string }> = {
  intro: { rows: ["revenue", "net", "fcf", "equity", "price", "mcap"] },
  ch3: { rows: ["eps", "per", "price", "dps", "epsGrowth"], note: "株価 ＝ EPS × PER" },
  ch4: { rows: ["revenue", "gross", "sga", "op", "net", "shares", "eps", "ocf", "sbc"], note: "EPS ＝ 純利益 ÷ 株式数" },
  ch5: { rows: ["price", "eps", "per", "earningsYield", "epsGrowth", "peg", "divYield"], note: "PER ＝ 株価 ÷ EPS" },
  ch6: { rows: ["net", "revenue", "assets", "equity", "netMargin", "assetTurnover", "leverage", "roe", "roic", "wacc", "pbr", "sustainableGrowth"], note: "ROE ＝ 純利益率 × 回転率 × レバレッジ" },
  ch7: { rows: ["revenue", "growth", "gross", "grossMargin", "mcap", "netDebt", "ev", "psr", "evSales", "sbcToSales"], note: "PSR ＝ 純利益率 × PER" },
  ch8: { rows: ["net", "da", "sbc", "ocf", "capex", "fcf", "fcfConversion", "fcfYield", "pfcf", "divTotal", "fcfPayout"], note: "FCF ＝ 営業CF － 設備投資" },
  ch9: { rows: ["assets", "debt", "cash", "equity", "ebitda", "interest", "equityRatio", "de", "netDebtEbitda", "coverage"], note: "カバレッジ ＝ 営業利益 ÷ 支払利息" },
  ch10: { rows: ["divYield", "epsGrowth", "price", "dps"], note: "期待リターン ≒ 配当利回り ＋ EPS成長率" },
  ch11: { rows: ["roe", "roic", "per", "peg", "pfcf", "fcfPayout", "equityRatio", "coverage", "psr"] },
  ch13: { rows: ["price", "eps", "per"], note: "シーン別ガイドの例はApex Retail" },
};

// 本文内の社名チップ用
export const companyNamePattern = /(Apex Retail|Nova Cloud|Ironclad Power)/g;
export const nameToId: Record<string, CompanyId> = {
  "Apex Retail": "apx",
  "Nova Cloud": "nova",
  "Ironclad Power": "irn",
};
