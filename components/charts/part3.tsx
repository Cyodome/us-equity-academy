"use client";

import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Figure, Legend, Slider, TipBox, axisProps, gridProps, pct, usd } from "./core";
import { accumulate, fv } from "@/lib/finance";

// 複利曲線（計算機つき）
export function C13() {
  const [mine, setMine] = useState(8);
  const data = useMemo(
    () =>
      Array.from({ length: 41 }, (_, y) => ({
        y,
        r5: fv(10000, 0.05, y),
        r7: fv(10000, 0.07, y),
        r10: fv(10000, 0.1, y),
        me: fv(10000, mine / 100, y),
      })),
    [mine]
  );
  return (
    <Figure title="1万ドルの複利成長曲線：後半ほど増加額が大きい" caption="年率5%・7%・10%で40年。オレンジの線は自分で設定した年率。複利の利益の大半は保有期間の後半に集中する。" height={350} interactive>
      {(c) => (
        <>
          <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Slider label="比べたい年率" value={mine} min={1} max={15} step={0.5} onChange={setMine} fmt={(v) => `${v}%`} />
            <p className="text-[0.82rem] tnum text-text">
              40年後：<b className="text-ink">{usd(fv(10000, mine / 100, 40))}</b>
            </p>
          </div>
          <Legend items={[{ label: "年率5%", color: c.q2 }, { label: "年率7%", color: c.q3 }, { label: "年率10%", color: c.q5 }, { label: `あなたの年率（${mine}%）`, color: c.s2 }]} />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="y" {...axisProps(c)} ticks={[0, 10, 20, 30, 40]} tickFormatter={(v) => `${v}年`} />
                <YAxis {...axisProps(c)} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}千$`} />
                <Tooltip content={<TipBox fmt={(v) => usd(v)} labelFmt={(l) => `${l}年後`} />} />
                <Line dataKey="r5" name="年率5%" stroke={c.q2} strokeWidth={2} dot={false} />
                <Line dataKey="r7" name="年率7%" stroke={c.q3} strokeWidth={2} dot={false} />
                <Line dataKey="r10" name="年率10%" stroke={c.q5} strokeWidth={2} dot={false} />
                <Line dataKey="me" name="あなたの年率" stroke={c.s2} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// 月500ドル積立の30年後
export function C14() {
  const data = [5, 7, 10].map((r) => {
    const total = (6000 * ((1 + r / 100) ** 30 - 1)) / (r / 100);
    return { name: `年率${r}%`, base: 180000, gain: total - 180000, total };
  });
  return (
    <Figure title="月500ドル積立の30年後：拠出額より運用益が大きくなる" caption="年6,000ドルを年末に積み立てた場合。拠出額は18万ドル。年率7%で56.7万ドルになり、増加分は拠出額の2.1倍。" height={280}>
      {(c) => (
        <>
          <Legend items={[{ label: "拠出額（18万ドル）", color: c.q1 }, { label: "市場が生んだ増加分", color: c.q4 }]} />
          <div className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="name" {...axisProps(c)} />
                <YAxis {...axisProps(c)} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}千$`} />
                <Tooltip content={<TipBox fmt={(v) => usd(v)} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="base" stackId="a" name="拠出額" fill={c.q1} barSize={64} />
                <Bar dataKey="gain" stackId="a" name="増加分" fill={c.q4} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="total" position="top" formatter={(v: unknown) => usd(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// ドローダウンの非対称性
export function C15() {
  const data = [10, 20, 30, 50, 70, 90].map((d) => ({ name: `▲${d}%`, down: -d, up: +((d / (100 - d)) * 100).toFixed(1) }));
  return (
    <Figure title="ドローダウンの非対称性：50%の下落は100%の上昇でしか戻らない" caption="回復に必要な上昇率＝下落率÷（1−下落率）。下落が深いほど、必要な上昇率は急激に大きくなる。" height={290}>
      {(c) => (
        <>
          <Legend items={[{ label: "下落率", color: c.neg }, { label: "回復に必要な上昇率", color: c.pos }]} />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="name" {...axisProps(c)} />
                <YAxis {...axisProps(c)} width={42} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={0} stroke={c.axis} />
                <Tooltip content={<TipBox fmt={(v) => pct(v)} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="down" name="下落率" fill={c.neg} radius={4} />
                <Bar dataKey="up" name="回復に必要な上昇率" fill={c.pos} radius={4}>
                  <LabelList dataKey="up" position="top" formatter={(v: unknown) => `＋${Math.round(Number(v))}%`} style={{ fill: c.text, fontSize: 10.5 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// コストの侵食
export function C16() {
  const data = [
    { name: "年率7%（コストなし）", v: 76123 },
    { name: "年率6%（コスト1%）", v: 57435 },
    { name: "年率5.5%（コスト1.5%）", v: 49840 },
  ];
  return (
    <Figure title="コストの複利的侵食：1%の差が30年で24.5%の差になる" caption="1万ドルを30年運用した場合の評価額。" height={250}>
      {(c) => (
        <div className="h-[250px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 22, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} />
              <XAxis dataKey="name" {...axisProps(c)} tick={{ fill: c.muted, fontSize: 10.5 }} interval={0} />
              <YAxis {...axisProps(c)} width={48} tickFormatter={(v) => `${Math.round(v / 1000)}千$`} />
              <Tooltip content={<TipBox fmt={(v) => usd(v)} />} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="v" name="30年後の評価額" radius={[4, 4, 0, 0]} barSize={70}>
                {data.map((d, i) => <Cell key={d.name} fill={[c.q5, c.q3, c.q2][i]} />)}
                <LabelList dataKey="v" position="top" formatter={(v: unknown) => `${usd(Number(v))}${Number(v) < 76123 ? `（${pct((Number(v) / 76123 - 1) * 100)}）` : ""}`} style={{ fill: c.text, fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// 板（オーダーブック）
export const book = {
  asks: [
    { p: 120.25, q: 900 },
    { p: 120.2, q: 1500 },
    { p: 120.15, q: 2200 },
    { p: 120.1, q: 3100 },
    { p: 120.05, q: 4800 },
  ],
  bids: [
    { p: 119.95, q: 5200 },
    { p: 119.9, q: 3600 },
    { p: 119.85, q: 2400 },
    { p: 119.8, q: 1700 },
    { p: 119.75, q: 1000 },
  ],
};
export function C24() {
  const max = 5200;
  return (
    <Figure title="板（オーダーブック）の構造：上に売り注文、下に買い注文が価格順に並ぶ" caption="最良売り気配$120.05と最良買い気配$119.95の間に$0.10のスプレッドがある。行にカーソルを合わせると数量を確認できる。" height={300}>
      {(c) => (
        <div className="mx-auto max-w-md text-[0.82rem] tnum">
          <div className="mb-1 grid grid-cols-[1fr_5.5rem_1fr] text-[0.72rem] text-muted">
            <span className="text-right">売り数量</span>
            <span className="text-center">価格</span>
            <span>買い数量</span>
          </div>
          {book.asks.map((a) => (
            <div key={a.p} className="group grid grid-cols-[1fr_5.5rem_1fr] items-center rounded hover:bg-surface-2">
              <div className="relative flex h-7 items-center justify-end pr-2">
                <div className="absolute inset-y-1 right-0 rounded-l" style={{ width: `${(a.q / max) * 100}%`, background: c.neg, opacity: 0.22 }} />
                <span className="relative font-bold" style={{ color: c.down }}>{a.q.toLocaleString()}</span>
              </div>
              <span className="text-center font-bold text-ink">${a.p.toFixed(2)}</span>
              <span />
            </div>
          ))}
          <div className="my-1 grid grid-cols-[1fr_5.5rem_1fr] items-center border-y border-dashed border-line-strong py-1 text-[0.74rem]">
            <span className="pr-2 text-right text-muted">スプレッド $0.10</span>
            <span className="text-center font-bold text-ink">現在値 $120.00</span>
            <span />
          </div>
          {book.bids.map((b) => (
            <div key={b.p} className="grid grid-cols-[1fr_5.5rem_1fr] items-center rounded hover:bg-surface-2">
              <span />
              <span className="text-center font-bold text-ink">${b.p.toFixed(2)}</span>
              <div className="relative flex h-7 items-center pl-2">
                <div className="absolute inset-y-1 left-0 rounded-r" style={{ width: `${(b.q / max) * 100}%`, background: c.pos, opacity: 0.22 }} />
                <span className="relative font-bold" style={{ color: c.blue }}>{b.q.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Figure>
  );
}

// デプスチャート
export function C26() {
  const asks = [
    [120.05, 4800], [120.1, 3100], [120.15, 2200], [120.2, 1500], [120.25, 900], [120.3, 12000], [120.35, 800], [120.4, 700],
  ];
  const bids = [
    [119.95, 5200], [119.9, 3600], [119.85, 2400], [119.8, 1700], [119.75, 1000], [119.7, 900], [119.65, 800], [119.6, 700],
  ];
  const rows: { p: number; bid?: number; ask?: number }[] = [];
  let cum = 0;
  bids.forEach(([p, q]) => {
    cum += q;
    rows.push({ p, bid: cum });
  });
  cum = 0;
  asks.forEach(([p, q]) => {
    cum += q;
    rows.push({ p, ask: cum });
  });
  rows.sort((a, b) => a.p - b.p);
  return (
    <Figure title="板の深さ（デプスチャート）：累積数量で「壁」の位置を読む" caption="$120.30に12,000株の売り注文が積まれ、上値を抑える「壁」になっている。" height={290}>
      {(c) => (
        <>
          <Legend items={[{ label: "買い注文の累積", color: c.pos }, { label: "売り注文の累積", color: c.neg }]} />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={rows} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="p" type="number" domain={[119.6, 120.4]} {...axisProps(c)} tickFormatter={(v) => `$${v.toFixed(2)}`} ticks={[119.6, 119.8, 120, 120.2, 120.4]} />
                <YAxis {...axisProps(c)} width={44} tickFormatter={(v) => `${v / 1000}千`} />
                <ReferenceLine x={120} stroke={c.ink} strokeDasharray="4 4" label={{ value: "現在値", position: "top", fill: c.text, fontSize: 10.5 }} />
                <Tooltip content={<TipBox fmt={(v) => `${v.toLocaleString()}株`} labelFmt={(l) => `$${Number(l).toFixed(2)}`} />} />
                <Area type="stepAfter" dataKey="bid" name="買い累積" stroke={c.pos} fill={c.pos} fillOpacity={0.18} strokeWidth={2} connectNulls={false} />
                <Area type="stepBefore" dataKey="ask" name="売り累積" stroke={c.neg} fill={c.neg} fillOpacity={0.18} strokeWidth={2} connectNulls={false} />
                <ReferenceDot x={120.3} y={24500} r={4} fill={c.neg} stroke={c.surface} label={{ value: "12,000株の壁", position: "left", fill: c.text, fontSize: 10.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// 価格の動きを決定的に作る（毎回同じ形）
function path(points: [number, number][], n: number, wobble: number, seed = 1) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5) * 2;
  const out: { d: number; p: number }[] = [];
  for (let d = 0; d <= n; d++) {
    let i = 0;
    while (i < points.length - 2 && points[i + 1][0] < d) i++;
    const [d0, p0] = points[i];
    const [d1, p1] = points[i + 1];
    const t = Math.min(1, Math.max(0, (d - d0) / (d1 - d0)));
    out.push({ d, p: +(p0 + (p1 - p0) * t + rnd() * wobble).toFixed(2) });
  }
  return out;
}

// ラダー買い
export function C19() {
  const data = path([[0, 122], [8, 114], [14, 108.5], [25, 101.5], [29, 97.5], [38, 103], [50, 110.5]], 50, 1.4, 7);
  const levels = [
    { p: 114, l: "第1段 $114（▲5%） 資金の30%" },
    { p: 108, l: "第2段 $108（▲10%） 資金の30%" },
    { p: 102, l: "第3段 $102（▲15%） 資金の40%" },
  ];
  const fills = levels.map((lv) => data.find((x) => x.p <= lv.p)).filter(Boolean) as { d: number; p: number }[];
  return (
    <Figure title="段階指値（ラダー）：下落局面で買値を分散する" caption="下落幅に応じて資金配分を厚くし、平均取得単価を下げる。黒い点が約定した位置。" height={280}>
      {(c) => (
        <div className="h-[280px]">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} />
              <XAxis dataKey="d" {...axisProps(c)} tickFormatter={(v) => `${v}日`} ticks={[0, 10, 20, 30, 40, 50]} />
              <YAxis {...axisProps(c)} domain={[95, 124]} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<TipBox fmt={(v) => usd(v, 2)} labelFmt={(l) => `${l}営業日目`} />} />
              {levels.map((lv) => (
                <ReferenceLine key={lv.p} y={lv.p} stroke={c.amber} strokeDasharray="5 4" label={{ value: lv.l, position: "insideTopLeft", fill: c.text, fontSize: 10.5 }} />
              ))}
              <Line dataKey="p" name="株価" stroke={c.s1} strokeWidth={2} dot={false} />
              {fills.map((f) => (
                <ReferenceDot key={f.d} x={f.d} y={f.p} r={5} fill={c.ink} stroke={c.surface} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// トレーリングストップ
export function C18() {
  const raw = path([[0, 123], [10, 129], [22, 145], [31, 152], [38, 160.5], [44, 154], [52, 147], [59, 137]], 59, 1.6, 3);
  let hi = 0;
  let fired: { d: number; p: number } | null = null;
  const data = raw.map((x) => {
    hi = Math.max(hi, x.p);
    const stop = +(hi * 0.85).toFixed(2);
    if (!fired && x.p <= stop) fired = { d: x.d, p: x.p };
    return { ...x, stop };
  });
  return (
    <Figure title="トレーリングストップ：上昇に追随し、反落で利益を確保する" caption="高値から15%下落した水準に発動ラインを置く。高値更新に合わせて自動で切り上がり、反落で売り注文が発動する。" height={290}>
      {(c) => (
        <>
          <Legend items={[{ label: "株価", color: c.s1 }, { label: "発動ライン（高値の▲15%）", color: c.amber, dash: true }]} />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="d" {...axisProps(c)} tickFormatter={(v) => `${v}日`} ticks={[0, 10, 20, 30, 40, 50, 60]} />
                <YAxis {...axisProps(c)} domain={[100, 165]} width={40} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<TipBox fmt={(v) => usd(v, 2)} labelFmt={(l) => `${l}営業日目`} />} />
                <Line dataKey="p" name="株価" stroke={c.s1} strokeWidth={2} dot={false} />
                <Line dataKey="stop" name="発動ライン" type="stepAfter" stroke={c.amber} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                {fired && <ReferenceDot x={(fired as { d: number }).d} y={(fired as { p: number }).p} r={6} fill={c.neg} stroke={c.surface} strokeWidth={2} label={{ value: "発動", position: "top", fill: c.text, fontSize: 11 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// ギャップダウンと逆指値
export function C17() {
  const pre = path([[0, 119.5], [5, 118.5], [10, 119], [15, 117], [19, 116.6]], 19, 1, 11);
  const post = path([[20, 103.5], [24, 101], [29, 100]], 29, 0.8, 5).filter((x) => x.d >= 20);
  const data = [...pre, ...post];
  return (
    <Figure title="ギャップダウン時の逆指値：成行型と指値型の違い" caption="決算で窓を開けて下落すると、逆指値・成行（$108）は寄付き$103.5付近で約定し、逆指値・指値（$106）は約定しないまま取り残される。" height={290}>
      {(c) => (
        <>
          <Legend items={[{ label: "株価", color: c.s1 }, { label: "逆指値（ストップ）$108", color: c.amber, dash: true }, { label: "ストップリミットの指値 $106", color: c.muted, dash: true }]} />
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="d" type="number" domain={[0, 29]} {...axisProps(c)} tickFormatter={(v) => `${v}日`} ticks={[0, 5, 10, 15, 20, 25]} />
                <YAxis {...axisProps(c)} domain={[95, 122]} width={40} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<TipBox fmt={(v) => usd(v, 2)} labelFmt={(l) => `${l}営業日目`} />} />
                <ReferenceLine y={108} stroke={c.amber} strokeDasharray="6 4" />
                <ReferenceLine y={106} stroke={c.muted} strokeDasharray="2 4" />
                <Line dataKey="p" name="株価" stroke={c.s1} strokeWidth={2} dot={false} />
                <ReferenceDot x={20} y={103.5} r={6} fill={c.neg} stroke={c.surface} strokeWidth={2} label={{ value: "寄付き$103.5で成行約定", position: "right", fill: c.text, fontSize: 10.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// 主要指標の現在値
export function C23() {
  const data = [
    { n: "FF金利（誘導目標上限）", v: 4.0 },
    { n: "10年国債利回り", v: 5.1 },
    { n: "CPI（前年比、9月）", v: 3.7 },
    { n: "PCE（前年比、8月）", v: 3.4 },
    { n: "コアPCE（前年比、8月）", v: 3.0 },
    { n: "失業率（9月）", v: 4.2 },
  ];
  return (
    <Figure title="主要指標の現在値（2026年10月16日時点）" caption="点線はFRBの物価目標2%。物価指標はいずれも目標を上回る。出所：FRB、BLS、BEA、Yahoo Finance。" height={270}>
      {(c) => (
        <div className="h-[270px]">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 24, right: 44, left: 8, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} horizontal={false} vertical />
              <XAxis type="number" domain={[0, 6]} {...axisProps(c)} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="n" {...axisProps(c)} width={150} tick={{ fill: c.muted, fontSize: 11 }} />
              <ReferenceLine x={2} stroke={c.down} strokeDasharray="5 4" label={{ value: "物価目標 2%", position: "top", fill: c.text, fontSize: 10.5 }} />
              <Tooltip content={<TipBox fmt={(v) => `${v.toFixed(2)}%`} />} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="v" name="現在値" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((d) => <Cell key={d.n} fill={d.n.includes("金利") || d.n.includes("国債") ? c.q4 : d.n.includes("失業") ? c.s4 : c.q2} />)}
                <LabelList dataKey="v" position="right" formatter={(v: unknown) => `${Number(v).toFixed(2).replace(/0$/, "")}%`} style={{ fill: c.text, fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// 発表カレンダー
export function C22() {
  const ev: { date: string; kind: "FOMC" | "CPI" | "雇用統計" | "PCE"; note: string }[] = [
    { date: "2026-10-02", kind: "雇用統計", note: "9月分（発表済）" },
    { date: "2026-10-14", kind: "CPI", note: "9月分（発表済）" },
    { date: "2026-10-28", kind: "FOMC", note: "10月会合" },
    { date: "2026-10-29", kind: "PCE", note: "9月分" },
    { date: "2026-11-06", kind: "雇用統計", note: "10月分" },
    { date: "2026-11-10", kind: "CPI", note: "10月分" },
    { date: "2026-11-25", kind: "PCE", note: "10月分" },
    { date: "2026-12-04", kind: "雇用統計", note: "11月分" },
    { date: "2026-12-09", kind: "FOMC", note: "12月会合（SEPあり）" },
    { date: "2026-12-10", kind: "CPI", note: "11月分" },
    { date: "2026-12-23", kind: "PCE", note: "11月分" },
    { date: "2027-01-08", kind: "雇用統計", note: "12月分" },
    { date: "2027-01-13", kind: "CPI", note: "12月分" },
    { date: "2027-01-27", kind: "FOMC", note: "1月会合" },
    { date: "2027-02-05", kind: "雇用統計", note: "1月分" },
    { date: "2027-02-11", kind: "CPI", note: "1月分" },
    { date: "2027-03-17", kind: "FOMC", note: "3月会合（SEPあり）" },
  ];
  const today = new Date().toLocaleDateString("sv-SE");
  const next = ev.find((e) => e.date >= today);
  const months = Array.from(new Set(ev.map((e) => e.date.slice(0, 7))));
  return (
    <Figure title="主要経済指標・FOMCの発表カレンダー（米国時間の日付）" caption="出所：federalreserve.gov、bls.gov、bea.gov（2026年10月18日時点の掲載内容）。日程は変更されることがあるため公式サイトで最終確認する。" height={240}>
      {(c) => {
        const col: Record<string, string> = { FOMC: c.q5, CPI: c.s2, 雇用統計: c.s3, PCE: c.s4 };
        return (
          <>
            <Legend items={Object.entries(col).map(([k, v]) => ({ label: k, color: v }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              {months.map((m) => (
                <div key={m} className="rounded-xl border border-line p-3">
                  <p className="mb-1.5 text-[0.78rem] font-bold text-ink">{m.replace("-", "年").replace(/^(\d+年)0?/, "$1")}月</p>
                  <ul className="space-y-1">
                    {ev.filter((e) => e.date.startsWith(m)).map((e) => {
                      const past = e.date < today;
                      const isNext = next === e;
                      return (
                        <li key={e.date + e.kind} className={`flex items-center gap-2 rounded-md px-1.5 py-0.5 text-[0.78rem] tnum ${past ? "opacity-50" : ""} ${isNext ? "bg-amber-soft" : ""}`}>
                          <span className="w-11 shrink-0 text-muted">{Number(e.date.slice(5, 7))}/{Number(e.date.slice(8))}</span>
                          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: col[e.kind] }} />
                          <span className="shrink-0 whitespace-nowrap font-bold text-ink">{e.kind}</span>
                          <span className="min-w-0 text-muted">{e.note}</span>
                          {isNext && <span className="ml-auto shrink-0 text-[0.68rem] font-bold text-ink">次の発表</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        );
      }}
    </Figure>
  );
}

// リスク許容度別の配分
export function C29() {
  const cats = [
    { k: "core", l: "米国株コア（VOO／VTI）" },
    { k: "div", l: "配当ETF（VYM／SCHD）" },
    { k: "grow", l: "成長ETF（QQQ）" },
    { k: "stock", l: "個別株" },
    { k: "cash", l: "短期米国債・現金" },
  ];
  const data = [
    { name: "保守型", core: 55, div: 20, grow: 0, stock: 0, cash: 25 },
    { name: "標準型", core: 65, div: 15, grow: 10, stock: 0, cash: 10 },
    { name: "積極型", core: 60, div: 0, grow: 20, stock: 10, cash: 10 },
  ];
  return (
    <Figure title="リスク許容度別の配分例（教材上の例示）" caption="株式比率が高いほど期待リターンも想定下落幅も大きい。特定銘柄の推奨ではない。" height={240}>
      {(c) => {
        const col = [c.s1, c.s2, c.s3, c.s4, c.q1];
        return (
          <>
            <Legend items={cats.map((x, i) => ({ label: x.l, color: col[i] }))} />
            <div className="h-[200px]">
              <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} {...axisProps(c)} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" {...axisProps(c)} width={52} />
                  <Tooltip content={<TipBox fmt={(v) => `${v}%`} />} cursor={{ fill: c["surface-2"] }} />
                  {cats.map((x, i) => (
                    <Bar key={x.k} dataKey={x.k} stackId="a" name={x.l} fill={col[i]} stroke={c.surface} strokeWidth={2} barSize={30}>
                      <LabelList dataKey={x.k} position="center" formatter={(v: unknown) => (Number(v) >= 10 ? `${v}%` : "")} style={{ fill: i === 4 ? c.ink : "#fff", fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      }}
    </Figure>
  );
}

// 最初の1年の投入計画（累計）
export function C28() {
  let a = 0, b = 0;
  const data = Array.from({ length: 12 }, (_, i) => {
    a += i === 0 ? 40 : i < 3 ? 30 : 0;
    b += 10;
    return { m: `${i + 1}か月目`, init: a, save: b, total: a + b };
  });
  return (
    <Figure title="最初の1年の投入計画：初期資金は3か月で段階投入、積立は毎月" caption="初期100万円を40万・30万・30万の3回に分け、毎月10万円の積立は初月から始める。12か月で累計220万円。" height={280}>
      {(c) => (
        <>
          <Legend items={[{ label: "初期資金100万円（累計）", color: c.q4 }, { label: "毎月の積立10万円（累計）", color: c.q2 }]} />
          <div className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="m" {...axisProps(c)} tick={{ fill: c.muted, fontSize: 10 }} interval={1} />
                <YAxis {...axisProps(c)} width={42} tickFormatter={(v) => `${v}万`} />
                <Tooltip content={<TipBox fmt={(v) => `${v}万円`} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="init" stackId="a" name="初期資金（累計）" fill={c.q4} stroke={c.surface} strokeWidth={1} />
                <Bar dataKey="save" stackId="a" name="積立（累計）" fill={c.q2} radius={[4, 4, 0, 0]} stroke={c.surface} strokeWidth={1}>
                  <LabelList dataKey="total" position="top" formatter={(v: unknown) => ([50, 130, 220].includes(Number(v)) ? `${v}万円` : "")} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// 3つの配分パターン
export function C20() {
  const pats = [
    { t: "A：シンプル1本", d: [{ n: "VOO", v: 100 }] },
    { t: "B：コア・サテライト", d: [{ n: "VTI", v: 70 }, { n: "QQQ", v: 20 }, { n: "個別株", v: 10 }] },
    { t: "C：配当重視", d: [{ n: "VYM", v: 50 }, { n: "SCHD", v: 30 }, { n: "VOO", v: 20 }] },
  ];
  return (
    <Figure title="3つの配分パターン" caption="同じ商品は同じ色で示す。VTIとVOOは約85%重複するため、パターンBではVTIのみを使う。" height={210}>
      {(c) => {
        const col: Record<string, string> = { VOO: c.s1, VTI: c.s3, QQQ: c.s2, 個別株: c.s4, VYM: c.q5, SCHD: c.q2 };
        return (
          <div className="grid gap-4 sm:grid-cols-3">
            {pats.map((p) => (
              <div key={p.t}>
                <p className="mb-2 text-[0.82rem] font-bold text-ink">{p.t}</p>
                <div className="flex h-8 overflow-hidden rounded-lg">
                  {p.d.map((x) => (
                    <div key={x.n} className="flex items-center justify-center border-r-2 text-[0.72rem] font-bold text-white last:border-r-0" style={{ width: `${x.v}%`, background: col[x.n], borderColor: c.surface }} title={`${x.n} ${x.v}%`}>
                      {x.v >= 15 ? `${x.v}%` : ""}
                    </div>
                  ))}
                </div>
                <ul className="mt-2 space-y-0.5 text-[0.78rem]">
                  {p.d.map((x) => (
                    <li key={x.n} className="flex items-center gap-2 tnum">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: col[x.n] }} />
                      <span className="text-text">{x.n}</span>
                      <span className="ml-auto font-bold text-ink">{x.v}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      }}
    </Figure>
  );
}

// 積立シミュレーション（計算機）
export function C21() {
  const [init, setInit] = useState(100);
  const [mon, setMon] = useState(10);
  const [rate, setRate] = useState(7);
  const p = useMemo(() => accumulate(init, mon, rate / 100, 30), [init, mon, rate]);
  const man = (v: number) => (v >= 10000 ? `${Math.floor(v / 10000)}億${Math.round(v % 10000).toLocaleString()}万円` : `${Math.round(v).toLocaleString()}万円`);
  return (
    <Figure title="積立シミュレーション：条件を変えて30年後を確かめる" caption="月次複利・月末積立。税・経費率・為替は簡略化した概算で、将来を保証するものではない。初期値は本文の前提（初期100万円＋月10万円）。" height={380} interactive>
      {(c) => (
        <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <Slider label="初期資金" value={init} min={0} max={500} step={10} onChange={setInit} fmt={(v) => `${v}万円`} />
            <Slider label="毎月の積立額" value={mon} min={1} max={30} step={1} onChange={setMon} fmt={(v) => `${v}万円`} />
            <Slider label="想定年率" value={rate} min={0} max={10} step={0.5} onChange={setRate} fmt={(v) => `${v}%`} />
            <table className="w-full text-[0.8rem] tnum">
              <thead>
                <tr className="text-muted">
                  <th className="text-left font-normal">年後</th>
                  <th className="text-right font-normal">元本</th>
                  <th className="text-right font-normal">評価額</th>
                </tr>
              </thead>
              <tbody>
                {[10, 20, 30].map((y) => (
                  <tr key={y} className="border-t border-line">
                    <td className="py-1">{y}年</td>
                    <td className="py-1 text-right">{man(p[y].principal)}</td>
                    <td className="py-1 text-right font-bold text-ink">{man(p[y].value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Legend items={[{ label: "評価額", color: c.s1 }, { label: "元本（拠出額累計）", color: c.muted, dash: true }]} />
            <div className="h-[270px]">
              <ResponsiveContainer>
                <AreaChart data={p} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid {...gridProps(c)} />
                  <XAxis dataKey="year" {...axisProps(c)} ticks={[0, 5, 10, 15, 20, 25, 30]} tickFormatter={(v) => `${v}年`} />
                  <YAxis {...axisProps(c)} width={52} tickFormatter={(v) => (v >= 10000 ? `${(v / 10000).toFixed(1)}億` : v >= 1000 ? `${(v / 1000).toFixed(0)}千万` : `${v}万`)} />
                  <Tooltip content={<TipBox fmt={(v) => man(v)} labelFmt={(l) => `${l}年後`} />} />
                  <Area dataKey="value" name="評価額" stroke={c.s1} fill={c.s1} fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
                  <Area dataKey="principal" name="元本" stroke={c.muted} strokeDasharray="5 4" fill="transparent" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Figure>
  );
}

// 3社の位置づけ（成長率×バリュエーション）
export function C27() {
  const pts = [
    { k: "co-apx" as const, n: "Apex Retail", x: 0.38, y: 0.32 },
    { k: "co-nova" as const, n: "Nova Cloud", x: 0.88, y: 0.88 },
    { k: "co-irn" as const, n: "Ironclad Power", x: 0.12, y: 0.3 },
  ];
  const W = 520, H = 330, pad = 40;
  const X = (v: number) => pad + v * (W - pad * 2);
  const Y = (v: number) => H - pad - v * (H - pad * 2);
  return (
    <Figure title="成長率 × バリュエーションによる3社の位置づけ" caption="Apex Retailは「成長を妥当な価格で」に最も近い。Nova Cloudは期待先行ゾーンから右下へ移る局面（成長を保ったまま倍率が下がる）が投資機会になる。" height={H}>
      {(c) => (
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[560px]" role="img" aria-label="3社の位置づけの四象限図">
          <rect x={X(0)} y={Y(1)} width={X(1) - X(0)} height={Y(0) - Y(1)} fill={c["surface-2"]} rx={10} />
          <line x1={X(0.5)} y1={Y(0)} x2={X(0.5)} y2={Y(1)} stroke={c.line} strokeWidth={1.5} />
          <line x1={X(0)} y1={Y(0.5)} x2={X(1)} y2={Y(0.5)} stroke={c.line} strokeWidth={1.5} />
          {[
            { t: "割高な低成長", x: 0.25, y: 0.94 },
            { t: "期待先行ゾーン", x: 0.75, y: 0.94 },
            { t: "バリュー候補", x: 0.25, y: 0.06 },
            { t: "成長を妥当な価格で", x: 0.75, y: 0.06 },
          ].map((q) => (
            <text key={q.t} x={X(q.x)} y={Y(q.y)} textAnchor="middle" fontSize={12} fill={c.muted}>
              {q.t}
            </text>
          ))}
          <text x={X(0)} y={H - 12} fontSize={11} fill={c.muted}>低成長</text>
          <text x={X(1)} y={H - 12} fontSize={11} fill={c.muted} textAnchor="end">高成長</text>
          <text x={12} y={Y(0)} fontSize={11} fill={c.muted} transform={`rotate(-90 12 ${Y(0)})`}>割安</text>
          <text x={12} y={Y(1)} fontSize={11} fill={c.muted} textAnchor="end" transform={`rotate(-90 12 ${Y(1)})`}>割高</text>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={c["co-nova"]} />
            </marker>
          </defs>
          <path d={`M${X(0.86)},${Y(0.82)} Q${X(0.9)},${Y(0.5)} ${X(0.8)},${Y(0.3)}`} fill="none" stroke={c["co-nova"]} strokeDasharray="5 4" strokeWidth={1.6} markerEnd="url(#arr)" />
          {pts.map((p) => (
            <g key={p.n}>
              <circle cx={X(p.x)} cy={Y(p.y)} r={9} fill={c[p.k]} stroke={c.surface} strokeWidth={2.5} />
              <text x={X(p.x) + (p.x > 0.7 ? -14 : 14)} y={Y(p.y) + 4} fontSize={12.5} fontWeight={700} fill={c.ink} textAnchor={p.x > 0.7 ? "end" : "start"}>
                {p.n}
              </text>
            </g>
          ))}
        </svg>
      )}
    </Figure>
  );
}
