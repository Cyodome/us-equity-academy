"use client";

import { useEffect, useRef, useState } from "react";

const keys = [
  "surface", "surface-2", "ink", "text", "muted", "line", "blue", "amber", "up", "down",
  "s1", "s2", "s3", "s4", "q1", "q2", "q3", "q4", "q5", "neg", "pos", "mid", "grid", "axis",
  "co-apx", "co-nova", "co-irn",
] as const;
export type Colors = Record<(typeof keys)[number], string>;

function read(): Colors {
  const cs = getComputedStyle(document.documentElement);
  return Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(`--${k}`).trim()])) as Colors;
}

// CSS変数の色を読み、テーマ切替で読み直す
export function useColors() {
  const [c, setC] = useState<Colors | null>(null);
  useEffect(() => {
    setC(read());
    const on = () => requestAnimationFrame(() => setC(read()));
    window.addEventListener("themechange", on);
    return () => window.removeEventListener("themechange", on);
  }, []);
  return c;
}

// 画面に入ったら描画（アニメーションをそこで再生）
export function useInView<T extends Element>(margin = "120px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && (setSeen(true), io.disconnect()), {
      rootMargin: margin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, seen };
}

export function Figure({
  title,
  caption,
  children,
  height = 300,
  interactive,
}: {
  title: string;
  caption: string;
  children: (c: Colors) => React.ReactNode;
  height?: number;
  interactive?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const colors = useColors();
  return (
    <figure ref={ref} className="not-prose my-2 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-[0.95rem] font-bold leading-snug text-ink">{title}</p>
        {interactive && (
          <span className="shrink-0 rounded-full bg-amber-soft px-2 py-0.5 text-[0.7rem] font-bold text-ink">動かせる</span>
        )}
      </div>
      <div style={{ minHeight: height }}>{seen && colors ? children(colors) : <div style={{ height }} className="animate-pulse rounded-xl bg-surface-2" />}</div>
      <figcaption className="mt-3 border-t border-line pt-2.5 text-[0.78rem] leading-relaxed text-muted">{caption}</figcaption>
    </figure>
  );
}

// Recharts共通の見た目
export const axisProps = (c: Colors) => ({
  stroke: c.axis,
  tick: { fill: c.muted, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: c.line },
});
export const gridProps = (c: Colors) => ({ stroke: c.grid, strokeDasharray: "0", vertical: false });

export function TipBox({ active, payload, label, fmt, labelFmt }: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string; payload?: Record<string, unknown> }[];
  label?: string | number;
  fmt?: (v: number, key?: string) => string;
  labelFmt?: (l: string | number | undefined) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[0.76rem] shadow-lg">
      {label !== undefined && <p className="mb-1 font-bold text-ink">{labelFmt ? labelFmt(label) : label}</p>}
      {payload
        .filter((p) => p.value !== undefined && p.name !== "_base")
        .map((p) => (
          <p key={String(p.dataKey) + p.name} className="flex items-center gap-2 tnum text-text">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted">{p.name}</span>
            <span className="ml-auto pl-3 font-bold text-ink">{fmt ? fmt(p.value as number, String(p.dataKey)) : p.value}</span>
          </p>
        ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dash?: boolean }[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.76rem] text-text">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.dash ? (
            <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: i.color }} />
          ) : (
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          )}
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[0.8rem]">
        <span className="text-muted">{label}</span>
        <span className="font-bold tnum text-ink">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--blue)]"
      />
    </label>
  );
}

export const yen = (v: number) => Math.round(v).toLocaleString("ja-JP") + "円";
export const usd = (v: number, d = 0) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (v: number, d = 1) => (v < 0 ? "▲" : "") + Math.abs(v).toFixed(d) + "%";
export const signed = (v: number, d = 1) => (v < 0 ? "▲" : "＋") + Math.abs(v).toFixed(d) + "%";
