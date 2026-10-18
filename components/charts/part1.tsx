"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Figure, Slider, TipBox, axisProps, gridProps, pct, signed, yen } from "./core";

// 取引時間の比較（日本時間）
export function C01() {
  const rows = [
    { label: "東京証券取引所", spans: [[9, 11.5], [12.5, 15.5]], text: ["9:00〜11:30", "12:30〜15:30"], key: "jp" },
    { label: "米国市場（夏時間）", spans: [[22.5, 29]], text: ["22:30〜翌5:00"], key: "su" },
    { label: "米国市場（冬時間）", spans: [[23.5, 30]], text: ["23:30〜翌6:00"], key: "wi" },
  ];
  const min = 8, max = 30;
  const x = (h: number) => ((h - min) / (max - min)) * 100;
  const ticks = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  return (
    <Figure title="取引時間の比較（日本時間）" caption="米国は3月第2日曜〜11月第1日曜が夏時間。2026年は11月1日に冬時間へ切り替わる。" height={170}>
      {(c) => (
        <div className="space-y-3 text-[0.78rem]">
          {rows.map((r, i) => (
            <div key={r.key} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 max-sm:grid-cols-1 max-sm:gap-1">
              <span className="text-text">{r.label}</span>
              <div className="relative h-7 rounded-md bg-surface-2">
                {r.spans.map(([a, b], j) => (
                  <div
                    key={j}
                    className="absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-md text-[0.7rem] font-bold text-white"
                    style={{ left: `${x(a)}%`, width: `${x(b) - x(a)}%`, background: i === 0 ? c.q2 : i === 1 ? c.q4 : c.q5 }}
                  >
                    <span className="truncate px-1">{r.text[j]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[7.5rem_1fr] gap-3 max-sm:grid-cols-1">
            <span />
            <div className="relative h-4 text-[0.68rem] text-muted tnum">
              {ticks.map((t) => (
                <span key={t} className="absolute -translate-x-1/2" style={{ left: `${x(t)}%` }}>
                  {t >= 24 ? `${t - 24}` : t}時
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Figure>
  );
}

// 為替と株価の二重の変動（計算機）
export function C02() {
  const [stock, setStock] = useState(10);
  const [fx, setFx] = useState(140);
  const buyPrice = 150, buyFx = 156;
  const now = buyPrice * (1 + stock / 100) * fx;
  const base = buyPrice * buyFx;
  const total = (now / base - 1) * 100;
  const stockPart = buyPrice * (stock / 100) * buyFx; // 為替を購入時に固定した場合の株価要因
  const fxPart = now - base - stockPart;
  const scen = [
    { name: "株価のみ", v: stockPart },
    { name: "為替のみ", v: fxPart },
    { name: "合計", v: now - base },
  ];
  return (
    <Figure
      title="株価と為替を動かして、円換算の損益を確かめる"
      caption="$150の株を1ドル＝156円で1株買った場合。円換算評価額＝株価×株数×為替レート。株価要因は購入時レートで換算し、残りを為替要因としている。"
      height={330}
      interactive
    >
      {(c) => (
        <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <Slider label="株価の変動" value={stock} min={-30} max={30} step={1} onChange={setStock} fmt={(v) => signed(v, 0)} />
            <Slider label="為替レート（円／ドル）" value={fx} min={130} max={180} step={1} onChange={setFx} fmt={(v) => `${v}円`} />
            <div className="rounded-xl bg-surface-2 p-3">
              <p className="text-[0.75rem] text-muted">円換算の評価額（購入時 {yen(base)}）</p>
              <p className="serif text-2xl font-extrabold tnum text-ink">{yen(now)}</p>
              <p className={`text-[0.95rem] font-bold tnum ${total < 0 ? "text-down" : "text-up"}`}>{signed(total)}</p>
            </div>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer>
              <BarChart data={scen} margin={{ top: 18, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="name" {...axisProps(c)} />
                <YAxis {...axisProps(c)} tickFormatter={(v) => `${Math.round(v / 1000)}千`} width={40} />
                <Tooltip content={<TipBox fmt={(v) => yen(v)} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="v" name="損益" radius={[4, 4, 4, 4]} isAnimationActive={false}>
                  {scen.map((s) => (
                    <Cell key={s.name} fill={s.v < 0 ? c.neg : c.pos} />
                  ))}
                  <LabelList dataKey="v" position="top" formatter={(v: unknown) => yen(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Figure>
  );
}

// 主要指数の構成銘柄数
export function C03() {
  const data = [
    { name: "ナスダック総合", n: 3000, m: "時価総額加重（約3,000超）" },
    { name: "S&P 500", n: 500, m: "時価総額加重（浮動株調整）" },
    { name: "ナスダック100", n: 100, m: "時価総額加重（金融除く）" },
    { name: "NYダウ", n: 30, m: "株価加重" },
  ];
  return (
    <Figure title="主要指数の構成銘柄数と算出方法" caption="NYダウだけが株価加重。銘柄数が多いほど分散は広いが、時価総額加重では上位銘柄の比重が大きくなる。" height={230}>
      {(c) => (
        <div className="h-[230px]">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 150, left: 8, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} horizontal={false} vertical />
              <XAxis type="number" {...axisProps(c)} />
              <YAxis type="category" dataKey="name" {...axisProps(c)} width={96} />
              <Tooltip content={<TipBox fmt={(v) => `${v.toLocaleString()}銘柄`} />} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="n" name="構成銘柄数" fill={c.s1} radius={[0, 4, 4, 0]} barSize={22}>
                <LabelList dataKey="m" position="right" style={{ fill: c.text, fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// ITバブル崩壊
export function C04() {
  const dd = [
    { name: "S&P 500", v: -49 },
    { name: "ナスダック総合", v: -78 },
  ];
  const yrs = [
    { name: "S&P 500", v: 7 },
    { name: "ナスダック総合", v: 15 },
  ];
  return (
    <Figure title="ITバブル崩壊：最大下落率と、2000年3月の高値を回復するまでの年数" caption="ナスダック総合は78%下落し、高値回復に約15年。S&P 500は49%下落、回復は約7年（2007年5月）。" height={250}>
      {(c) => (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { d: dd, t: "最大下落率（%）", f: (v: number) => pct(v, 0) },
            { d: yrs, t: "回復までの年数", f: (v: number) => `約${v}年` },
          ].map((g) => (
            <div key={g.t}>
              <p className="mb-1 text-[0.76rem] text-muted">{g.t}</p>
              <div className="h-[220px]">
                <ResponsiveContainer>
                  <BarChart data={g.d} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid {...gridProps(c)} />
                    <XAxis dataKey="name" {...axisProps(c)} />
                    <YAxis {...axisProps(c)} width={34} />
                    <Tooltip content={<TipBox fmt={g.f} />} cursor={{ fill: c["surface-2"] }} />
                    <Bar dataKey="v" name={g.t} radius={[4, 4, 4, 4]} barSize={56}>
                      {g.d.map((x, i) => (
                        <Cell key={x.name} fill={i === 0 ? c.s1 : c.s2} />
                      ))}
                      <LabelList dataKey="v" position="top" formatter={(v: unknown) => g.f(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </Figure>
  );
}
