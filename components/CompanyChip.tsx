"use client";

import { companies, fmtValue, metrics, type CompanyId } from "@/lib/companies";
import { useDrawer } from "./Providers";

export function CompanyChip({ id, children }: { id: CompanyId; children: React.ReactNode }) {
  const d = useDrawer();
  const c = companies[id];
  const m = metrics(c);
  return (
    <span className="group relative inline-block">
      <button
        type="button"
        onClick={() => d.show(id)}
        className="inline-flex items-baseline gap-1 rounded-md px-1 font-bold underline decoration-dotted decoration-1 underline-offset-[5px] transition-colors hover:bg-surface-2"
        style={{ color: c.color, textDecorationColor: c.color }}
        aria-label={`${c.name}の財務データを開く`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 hidden w-60 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-[0.76rem] leading-relaxed text-text opacity-0 shadow-lg transition-opacity duration-150 md:block group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="mb-1 flex items-baseline justify-between">
          <span className="font-bold text-ink">{c.name}</span>
          <span className="tnum font-bold" style={{ color: c.color }}>{c.ticker}</span>
        </span>
        <span className="grid grid-cols-2 gap-x-3 tnum">
          <span className="text-muted">株価</span><span className="text-right">{fmtValue(c.share.price, "usd")}</span>
          <span className="text-muted">EPS</span><span className="text-right">{fmtValue(m.eps, "usd")}</span>
          <span className="text-muted">純利益</span><span className="text-right">{fmtValue(c.pl.net, "oku")}億</span>
          <span className="text-muted">FCF</span><span className="text-right">{fmtValue(c.cf.fcf, "oku")}億</span>
          <span className="text-muted">自己資本比率</span><span className="text-right">{fmtValue(m.equityRatio, "pct")}</span>
        </span>
        <span className="mt-1.5 block text-[0.7rem] text-muted">クリックで全表を開く</span>
      </span>
    </span>
  );
}
