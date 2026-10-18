// クライアントからも読める目次の型と部構成（fsに依存しない）
export const parts = [
  { num: 1, roman: "I", title: "市場と制度を知る", lead: "米国株の基本構造、日本株との違い、為替と税、NISA、株価指数の性格" },
  { num: 2, roman: "II", title: "財務指標が株価を動かすメカニズム", lead: "架空企業3社の共通データで、計算式から投資判断まで" },
  { num: 3, roman: "III", title: "証券会社で執行する", lead: "口座の選び方、板と注文方法、経済指標、最初の100万円とポートフォリオ" },
  { num: 4, roman: "付", title: "付録", lead: "用語集と出典" },
];

export type TocItem = {
  id: string;
  num: number;
  part: number;
  title: string;
  subtitle?: string;
  lead: string;
  label: string;
  sections: { id: string; num: string | null; title: string }[];
};
