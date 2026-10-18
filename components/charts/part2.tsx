"use client";

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Figure, Legend, Slider, TipBox, axisProps, gridProps, pct, signed, usd } from "./core";
import { dcf } from "@/lib/finance";

// 営業レバレッジ
export function C06() {
  const data = [
    { name: "売上高", down: -10, up: 10 },
    { name: "営業利益", down: -31.8, up: 31.8 },
    { name: "EPS", down: -35, up: 35 },
  ];
  return (
    <Figure title="営業レバレッジ：売上の10%の変動がEPSでは35%に増幅される" caption="Apex Retail。売上原価を変動費（65%）、販管費24億ドルを固定費、支払利息1.0億ドルと税率20%を一定とした試算。" height={280}>
      {(c) => (
        <>
          <Legend items={[{ label: "売上▲10%のとき", color: c.neg }, { label: "売上＋10%のとき", color: c.pos }]} />
          <div className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 18, right: 8, left: 0, bottom: 4 }} barGap={2}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="name" {...axisProps(c)} />
                <YAxis {...axisProps(c)} width={38} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={0} stroke={c.axis} />
                <Tooltip content={<TipBox fmt={(v) => signed(v)} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="down" name="売上▲10%" fill={c.neg} radius={4} barSize={34}>
                  <LabelList dataKey="down" position="bottom" formatter={(v: unknown) => signed(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
                <Bar dataKey="up" name="売上＋10%" fill={c.pos} radius={4} barSize={34}>
                  <LabelList dataKey="up" position="top" formatter={(v: unknown) => signed(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Figure>
  );
}

// EPS成長率別のEPS推移
export function C05() {
  const rates = [3, 7, 10, 15, 20];
  const data = Array.from({ length: 6 }, (_, y) => {
    const row: Record<string, number> = { y };
    rates.forEach((r) => (row[`r${r}`] = +(8 * (1 + r / 100) ** y).toFixed(2)));
    return row;
  });
  return (
    <Figure title="EPS成長率別のEPS推移（Apex Retail、初期EPS $8.00）" caption="年率の数ポイントの差が複利で拡大する。PER 15x一定なら株価も同じ比率で動く。" height={300}>
      {(c) => {
        const col = [c.q1, c.q2, c.q3, c.q4, c.q5];
        return (
          <>
            <Legend items={rates.map((r, i) => ({ label: `年率${r}%`, color: col[i] }))} />
            <div className="h-[270px]">
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 8, right: 54, left: 0, bottom: 0 }}>
                  <CartesianGrid {...gridProps(c)} />
                  <XAxis dataKey="y" {...axisProps(c)} tickFormatter={(v) => `${v}年`} />
                  <YAxis {...axisProps(c)} width={40} domain={[6, 21]} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<TipBox fmt={(v) => usd(v, 2)} labelFmt={(l) => `${l}年後`} />} />
                  {rates.map((r, i) => (
                    <Line key={r} type="monotone" dataKey={`r${r}`} name={`年率${r}%`} stroke={col[i]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}>
                      <LabelList dataKey={`r${r}`} position="right" content={(p: { x?: number | string; y?: number | string; index?: number; value?: unknown }) =>
                        p.index === 5 ? <text x={Number(p.x) + 6} y={Number(p.y) + 4} fontSize={11} fill={c.text}>{usd(Number(p.value), 2)}</text> : null
                      } />
                    </Line>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      }}
    </Figure>
  );
}

// 妥当PERの感応度（ヒートマップ）
export function C07() {
  const rs = [8, 9, 10, 11];
  const gs = [2, 4, 6];
  const v = (r: number, g: number) => 0.5 / ((r - g) / 100);
  return (
    <Figure title="妥当PERの感応度（配当性向50%）：金利上昇でPERは圧縮される" caption="妥当PER＝配当性向÷（r−g）。色が濃いほど高PER。g＝6%の列は、rが8%から11%に上がるとPERが25xから10xへ60%下落する。" height={230}>
      {(c) => {
        const scale = [c.q1, c.q2, c.q3, c.q4, c.q5];
        const pick = (x: number) => scale[Math.min(4, Math.floor((Math.log(x) - Math.log(5)) / ((Math.log(26) - Math.log(5)) / 5)))];
        return (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-separate border-spacing-1 text-center text-[0.85rem] tnum">
              <thead>
                <tr>
                  <th className="text-left text-[0.74rem] font-normal text-muted">割引率 r ＼ 成長率 g</th>
                  {gs.map((g) => (
                    <th key={g} className="text-[0.78rem] font-bold text-ink">g＝{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rs.map((r) => (
                  <tr key={r}>
                    <th className="text-left text-[0.78rem] font-bold text-ink">r＝{r}%</th>
                    {gs.map((g) => {
                      const val = v(r, g);
                      const bg = pick(val);
                      const dark = scale.indexOf(bg) >= 3;
                      return (
                        <td key={g} className="rounded-md py-3 font-bold transition-transform hover:scale-[1.03]" style={{ background: bg, color: dark ? "#fff" : c.ink }} title={`r ${r}%・g ${g}% → ${val.toFixed(1)}x`}>
                          {val.toFixed(1)}x
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }}
    </Figure>
  );
}

// 金利環境だけが変わった場合の株価
export function C25() {
  const data = [
    { name: "利下げ局面", per: 17 },
    { name: "現状", per: 15 },
    { name: "利上げ観測", per: 13 },
    { name: "急激な利上げ", per: 11 },
  ].map((d) => ({ ...d, label: `${d.name}\nPER ${d.per}x`, price: 8 * d.per }));
  return (
    <Figure title="EPS $8.00のまま、金利環境だけが変わった場合の株価（Apex Retail）" caption="業績は何も変わらなくても、PERの経路だけで株価は▲27%から＋13%まで動く。" height={260}>
      {(c) => (
        <div className="h-[260px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} />
              <XAxis dataKey="name" {...axisProps(c)} tickFormatter={(v, i) => `${v}（${data[i]?.per}x）`} interval={0} tick={{ fill: c.muted, fontSize: 10.5 }} />
              <YAxis {...axisProps(c)} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<TipBox fmt={(v) => `${usd(v)}（${signed((v / 120 - 1) * 100, 0)}）`} />} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="price" name="株価" radius={[4, 4, 0, 0]} barSize={52}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.per === 15 ? c.q4 : d.per > 15 ? c.pos : c.neg} />
                ))}
                <LabelList dataKey="price" position="top" formatter={(v: unknown) => `${usd(Number(v))}（${signed((Number(v) / 120 - 1) * 100, 0)}）`} style={{ fill: c.text, fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// デュポン分解
export function C08() {
  const groups = [
    { t: "純利益率（%）", a: 8, i: 11, f: (v: number) => `${v.toFixed(1)}%` },
    { t: "総資産回転率（倍）", a: 1.0, i: 0.33, f: (v: number) => v.toFixed(2) },
    { t: "財務レバレッジ（倍）", a: 2.0, i: 3.75, f: (v: number) => v.toFixed(2) },
  ];
  return (
    <Figure title="デュポン分解：ROE 16.0%と13.75%の源泉の違い" caption="Ironclad Powerは財務レバレッジ3.75倍（総資産の73%を負債で賄う）がROEを押し上げている。" height={240}>
      {(c) => (
        <>
          <Legend items={[{ label: "Apex Retail", color: c["co-apx"] }, { label: "Ironclad Power", color: c["co-irn"] }]} />
          <div className="grid grid-cols-3 gap-2">
            {groups.map((g) => (
              <div key={g.t}>
                <p className="mb-1 text-center text-[0.72rem] text-muted">{g.t}</p>
                <div className="h-[190px]">
                  <ResponsiveContainer>
                    <BarChart data={[{ n: "APX", v: g.a }, { n: "IRN", v: g.i }]} margin={{ top: 20, right: 2, left: 2, bottom: 0 }}>
                      <XAxis dataKey="n" {...axisProps(c)} />
                      <YAxis hide />
                      <Tooltip content={<TipBox fmt={g.f} />} cursor={{ fill: c["surface-2"] }} />
                      <Bar dataKey="v" name={g.t} radius={[4, 4, 0, 0]}>
                        <Cell fill={c["co-apx"]} />
                        <Cell fill={c["co-irn"]} />
                        <LabelList dataKey="v" position="top" formatter={(v: unknown) => g.f(Number(v))} style={{ fill: c.text, fontSize: 11 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Figure>
  );
}

// Nova Cloud 5年後株価シナリオ
export function C09() {
  const data = [
    { name: "ベア", sub: "成長15%・利益率10%・PER20x", price: 63, r: -20.6 },
    { name: "ベース", sub: "成長25%・利益率15%・PER25x", price: 179, r: -2.2 },
    { name: "ブル", sub: "成長40%・利益率20%・PER30x", price: 506, r: 20.4 },
  ];
  return (
    <Figure title="Nova Cloud：5年後株価のシナリオ分析（希薄化 年5%込み）" caption="点線は現在株価$200。ベースケースでも現在株価を下回る。PSR 10xが織り込む期待の高さを示す。" height={280}>
      {(c) => (
        <div className="h-[280px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridProps(c)} />
              <XAxis dataKey="name" {...axisProps(c)} tickFormatter={(v, i) => `${v}：${data[i]?.sub}`} tick={{ fill: c.muted, fontSize: 10 }} interval={0} />
              <YAxis {...axisProps(c)} width={42} tickFormatter={(v) => `$${v}`} />
              <ReferenceLine y={200} stroke={c.ink} strokeDasharray="5 4" label={{ value: "現在株価 $200", position: "insideTopLeft", fill: c.text, fontSize: 11 }} />
              <Tooltip content={<TipBox fmt={(v) => usd(v)} />} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="price" name="5年後の株価" radius={[4, 4, 0, 0]} barSize={60}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.price < 200 ? c.neg : c.pos} />
                ))}
                <LabelList dataKey="price" position="top" content={(p: { x?: number | string; y?: number | string; width?: number | string; index?: number }) => {
                  const d = data[p.index ?? 0];
                  return (
                    <text x={Number(p.x) + Number(p.width) / 2} y={Number(p.y) - 6} textAnchor="middle" fontSize={11} fill={c.text}>
                      {usd(d.price)}（年率{signed(d.r)}）
                    </text>
                  );
                }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// Apex Retail FCFウォーターフォール
export function C10() {
  const steps = [
    { name: "純利益", v: 8, total: true },
    { name: "＋減価償却", v: 2 },
    { name: "＋株式報酬", v: 0.3 },
    { name: "＋運転資本", v: 1.7 },
    { name: "営業CF", v: 12, total: true },
    { name: "－設備投資", v: -3 },
    { name: "FCF", v: 9, total: true },
  ];
  let run = 0;
  const data = steps.map((s) => {
    if (s.total) {
      run = s.v;
      return { name: s.name, _base: 0, val: s.v, raw: s.v, kind: "total" };
    }
    const base = s.v >= 0 ? run : run + s.v;
    run += s.v;
    return { name: s.name, _base: base, val: Math.abs(s.v), raw: s.v, kind: s.v >= 0 ? "up" : "down" };
  });
  return (
    <Figure title="Apex Retail：純利益からFCFへの橋渡し（億ドル）" caption="純利益8.0億に対しFCFは9.0億。利益の全額以上が現金として手元に残る。" height={270}>
      {(c) => (
        <div className="h-[270px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps(c)} />
              <XAxis dataKey="name" {...axisProps(c)} interval={0} tick={{ fill: c.muted, fontSize: 10.5 }} />
              <YAxis {...axisProps(c)} width={30} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { raw: number };
                return <TipBox active payload={[{ name: "金額", value: d.raw, color: c.s1, dataKey: "raw" }]} label={label} fmt={(v) => `${v > 0 ? "" : "▲"}${Math.abs(v).toFixed(1)}億ドル`} />;
              }} cursor={{ fill: c["surface-2"] }} />
              <Bar dataKey="_base" stackId="w" fill="transparent" name="_base" isAnimationActive={false} />
              <Bar dataKey="val" stackId="w" name="金額" radius={[3, 3, 3, 3]}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.kind === "total" ? c.q4 : d.kind === "up" ? c.q2 : c.neg} />
                ))}
                <LabelList dataKey="raw" position="top" formatter={(v: unknown) => (Number(v) < 0 ? `▲${Math.abs(Number(v)).toFixed(1)}` : Number(v).toFixed(1))} style={{ fill: c.text, fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Figure>
  );
}

// DCF計算機
export function C11() {
  const [r, setR] = useState(9);
  const [g, setG] = useState(3);
  const [gr, setGr] = useState(8);
  const res = useMemo(() => dcf({ fcf0: 9, growth: gr / 100, years: 5, r: r / 100, g: g / 100, netDebt: 10, shares: 1 }), [r, g, gr]);
  const price = 120;
  const mos = ((res.price - price) / res.price) * 100;
  const grid = [8, 9, 10, 11].map((rr) => [2, 3].map((gg) => dcf({ fcf0: 9, growth: gr / 100, years: 5, r: rr / 100, g: gg / 100, netDebt: 10, shares: 1 }).price));
  const valid = r > g;
  return (
    <Figure
      title="DCF計算機：割引率と成長率で理論株価はどれだけ動くか（Apex Retail）"
      caption="基準：FCF 9.0億ドル、1〜5年目の成長率8%、純有利子負債10億ドル、株式数1.00億株。現在株価$120は r 11%・g 2% の悲観的な前提に相当する。"
      height={380}
      interactive
    >
      {(c) => (
        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Slider label="割引率 r（WACC）" value={r} min={7} max={12} step={0.5} onChange={setR} fmt={(v) => `${v.toFixed(1)}%`} />
            <Slider label="永続成長率 g（6年目以降）" value={g} min={0} max={4} step={0.5} onChange={setG} fmt={(v) => `${v.toFixed(1)}%`} />
            <Slider label="FCF成長率（1〜5年目）" value={gr} min={0} max={15} step={1} onChange={setGr} fmt={(v) => `${v}%`} />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-[0.72rem] text-muted">理論株価</p>
                <p className="serif text-2xl font-extrabold tnum text-ink">{valid ? usd(res.price) : "―"}</p>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-[0.72rem] text-muted">安全域（株価$120）</p>
                <p className={`serif text-2xl font-extrabold tnum ${mos >= 25 ? "text-up" : mos < 0 ? "text-down" : "text-ink"}`}>{valid ? pct(mos, 0) : "―"}</p>
              </div>
            </div>
            <p className="text-[0.76rem] leading-relaxed text-muted">
              {valid ? <>企業価値のうちターミナルバリューが <b className="text-ink tnum">{pct(res.tvShare, 0)}</b> を占める。遠い将来の前提ほど結果を大きく左右する。</> : "割引率は永続成長率より大きくする必要がある。"}
            </p>
          </div>
          <div>
            <p className="mb-2 text-[0.76rem] text-muted">感応度（FCF成長率{gr}%のとき）。枠は現在の設定に最も近い組み合わせ</p>
            <table className="w-full border-separate border-spacing-1 text-center text-[0.85rem] tnum">
              <thead>
                <tr>
                  <th className="text-left text-[0.72rem] font-normal text-muted">r ＼ g</th>
                  <th className="text-[0.78rem] text-ink">2%</th>
                  <th className="text-[0.78rem] text-ink">3%</th>
                </tr>
              </thead>
              <tbody>
                {grid.map((row, i) => (
                  <tr key={i}>
                    <th className="text-left text-[0.78rem] text-ink">{8 + i}%</th>
                    {row.map((p, j) => {
                      const on = Math.abs(r - (8 + i)) < 0.5 && Math.abs(g - (2 + j)) < 0.5;
                      const near = Math.abs(p - price) < 2;
                      return (
                        <td key={j} className="rounded-md py-2.5 font-bold" style={{ background: p >= 160 ? c.q4 : p >= 140 ? c.q3 : c.q1, color: p >= 140 ? "#fff" : c.ink, outline: on ? `2px solid ${c.amber}` : near ? `1px dashed ${c.ink}` : undefined }}>
                          {usd(p)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Figure>
  );
}

// レバレッジのストレステスト
export function C12() {
  const eq = [
    { n: "Apex Retail", v: -40, k: "co-apx" as const },
    { n: "Nova Cloud", v: -27, k: "co-nova" as const },
    { n: "Ironclad Power", v: -75, k: "co-irn" as const },
  ];
  const cov = [
    { n: "Apex Retail", v: 5.5, k: "co-apx" as const, l: "5.5x" },
    { n: "Nova Cloud", v: 0, k: "co-nova" as const, l: "無借金" },
    { n: "Ironclad Power", v: 1.7, k: "co-irn" as const, l: "1.7x" },
  ];
  return (
    <Figure title="レバレッジのストレステスト" caption="左：資産価値が20%下落したときの自己資本の減少率。右：営業利益が半減したときのインタレスト・カバレッジ（点線は安全ラインの3.0x）。" height={250}>
      {(c) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-[230px]">
            <ResponsiveContainer>
              <BarChart data={eq} margin={{ top: 8, right: 8, left: 0, bottom: 22 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="n" {...axisProps(c)} tick={{ fill: c.muted, fontSize: 10 }} interval={0} />
                <YAxis {...axisProps(c)} width={36} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<TipBox fmt={(v) => pct(v, 0)} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="v" name="自己資本の減少率" radius={4} barSize={44}>
                  {eq.map((d) => <Cell key={d.n} fill={c[d.k]} />)}
                  <LabelList dataKey="v" position="bottom" formatter={(v: unknown) => pct(Number(v), 0)} style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[230px]">
            <ResponsiveContainer>
              <BarChart data={cov} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps(c)} />
                <XAxis dataKey="n" {...axisProps(c)} tick={{ fill: c.muted, fontSize: 10 }} interval={0} />
                <YAxis {...axisProps(c)} width={30} domain={[0, 7]} />
                <ReferenceLine y={3} stroke={c.amber} strokeDasharray="5 4" label={{ value: "安全ライン 3.0x", position: "insideTopRight", fill: c.text, fontSize: 10.5 }} />
                <Tooltip content={<TipBox fmt={(v) => `${v.toFixed(1)}x`} />} cursor={{ fill: c["surface-2"] }} />
                <Bar dataKey="v" name="カバレッジ" radius={[4, 4, 0, 0]} barSize={44}>
                  {cov.map((d) => <Cell key={d.n} fill={c[d.k]} />)}
                  <LabelList dataKey="l" position="top" style={{ fill: c.text, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Figure>
  );
}

// Apex Retail FCFの配分
export function C30() {
  const parts = [
    { n: "配当（$3.20 × 1.00億株）", v: 3.2 },
    { n: "自社株買い", v: 5.0 },
    { n: "負債返済", v: 0.8 },
  ];
  return (
    <Figure title="Apex Retail：FCF 9.0億ドルの配分" caption="FCFの91%（8.2億ドル）が株主還元に回り、残りで負債を圧縮している。" height={150}>
      {(c) => {
        const col = [c.s1, c.s3, c.s4];
        return (
          <div>
            <div className="flex h-11 overflow-hidden rounded-lg">
              {parts.map((p, i) => (
                <div key={p.n} title={`${p.n} ${p.v.toFixed(1)}億ドル`} className="flex items-center justify-center text-[0.8rem] font-bold text-white" style={{ width: `${(p.v / 9) * 100}%`, background: col[i], borderRight: i < 2 ? `2px solid ${c.surface}` : undefined }}>
                  {Math.round((p.v / 9) * 100)}%
                </div>
              ))}
            </div>
            <ul className="mt-3 grid gap-1.5 text-[0.82rem] sm:grid-cols-3">
              {parts.map((p, i) => (
                <li key={p.n} className="flex items-center gap-2 tnum">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: col[i] }} />
                  <span className="text-text">{p.n}</span>
                  <span className="ml-auto font-bold text-ink">{p.v.toFixed(1)}億</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    </Figure>
  );
}
