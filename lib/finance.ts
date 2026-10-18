// 本文の計算と同じ式。グラフ・計算機・検証スクリプトで共通に使う。

export function dcf(p: { fcf0: number; growth: number; years: number; r: number; g: number; netDebt: number; shares: number }) {
  let pv = 0;
  let fcf = p.fcf0;
  for (let t = 1; t <= p.years; t++) {
    fcf *= 1 + p.growth;
    pv += fcf / (1 + p.r) ** t;
  }
  const tv = (fcf * (1 + p.g)) / (p.r - p.g);
  const tvPv = tv / (1 + p.r) ** p.years;
  const ev = pv + tvPv;
  const equity = ev - p.netDebt;
  return { pvExplicit: pv, tv, tvPv, ev, equity, price: equity / p.shares, tvShare: (tvPv / ev) * 100 };
}

export const fv = (pv: number, r: number, n: number) => pv * (1 + r) ** n;
export const annuityFv = (pmt: number, r: number, n: number) => (pmt * ((1 + r) ** n - 1)) / r;

// 初期資金＋毎月積立（月次複利、月末積立）
export function accumulate(initial: number, monthly: number, annualRate: number, years: number) {
  const m = annualRate / 12;
  let v = initial;
  const path: { year: number; value: number; principal: number }[] = [{ year: 0, value: initial, principal: initial }];
  for (let i = 1; i <= years * 12; i++) {
    v = v * (1 + m) + monthly;
    if (i % 12 === 0) path.push({ year: i / 12, value: v, principal: initial + monthly * i });
  }
  return path;
}

export const recoveryGain = (drawdown: number) => drawdown / (1 - drawdown);
