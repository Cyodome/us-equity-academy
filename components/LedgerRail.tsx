"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chapterRail, companies, companyOrder, fmtValue, rowDefs } from "@/lib/companies";
import { useDrawer } from "./Providers";
import { IconLedger } from "./Icons";

function RailTable({ chapter }: { chapter: string }) {
  const conf = chapterRail[chapter];
  if (!conf) return null;
  return (
    <table className="w-full text-[0.76rem] tnum">
      <thead>
        <tr className="text-[0.7rem]">
          <th className="pb-1.5 text-left font-normal text-muted"> </th>
          {companyOrder.map((id) => (
            <th key={id} className="pb-1.5 text-right font-bold" style={{ color: companies[id].color }}>
              {companies[id].ticker}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {conf.rows.map((k) => {
          const def = rowDefs[k];
          if (!def) return null;
          return (
            <tr key={k} className="border-t border-line">
              <th scope="row" className="py-1 pr-1 text-left font-normal text-muted">
                {def.label}
              </th>
              {companyOrder.map((id) => {
                const v = def.get(companies[id]);
                return (
                  <td key={id} className={`py-1 pl-1.5 text-right ${v != null && v < 0 ? "text-down" : "text-ink"}`}>
                    {fmtValue(v, def.fmt)}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// 広い画面：右レールに常時表示
export function LedgerRail({ chapter }: { chapter: string }) {
  const d = useDrawer();
  const conf = chapterRail[chapter];
  if (!conf) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4" style={{ boxShadow: "var(--shadow)" }}>
      <p className="serif text-[0.98rem] font-extrabold text-ink">この章の数字</p>
      <p className="mb-3 text-[0.72rem] text-muted">金額は億ドル。前のページに戻らずに確認できます。</p>
      {conf.note && <p className="mb-3 rounded-lg bg-blue-soft px-2.5 py-1.5 text-[0.76rem] font-bold text-ink">{conf.note}</p>}
      <RailTable chapter={chapter} />
      <button
        onClick={() => d.show("all", "pl")}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-1.5 text-[0.78rem] text-ink hover:bg-surface-2"
      >
        <IconLedger /> 財務諸表をすべて開く
      </button>
    </div>
  );
}

// 狭い画面：本文冒頭に折りたたみで表示
export function LedgerInline({ chapter }: { chapter: string }) {
  const [open, setOpen] = useState(false);
  const d = useDrawer();
  const conf = chapterRail[chapter];
  if (!conf) return null;
  return (
    <div className="rounded-xl border border-line bg-surface xl:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[0.88rem] font-bold text-ink">
          <IconLedger /> この章で使う3社の数字
        </span>
        <span className="text-[0.76rem] text-muted">{open ? "閉じる" : "開く"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {conf.note && <p className="mb-2 rounded-lg bg-blue-soft px-2.5 py-1.5 text-[0.78rem] font-bold text-ink">{conf.note}</p>}
              <RailTable chapter={chapter} />
              <button onClick={() => d.show("all", "pl")} className="mt-3 text-[0.8rem] text-blue underline underline-offset-4">
                財務諸表をすべて開く
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 第II部のページで常に出す小さなボタン
export function LedgerFab() {
  const d = useDrawer();
  return (
    <button
      onClick={() => d.show("all")}
      className="no-print fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[0.84rem] font-bold text-paper shadow-lg transition-transform hover:-translate-y-0.5 xl:hidden"
      style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom) * 0)" }}
    >
      <IconLedger /> 3社の数字
    </button>
  );
}
