"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { companies, companyOrder, type CompanyId } from "@/lib/companies";
import { useDrawer, type DrawerTab } from "./Providers";
import { SheetTable, sheets } from "./CompanySheet";
import { IconClose } from "./Icons";

const tabs: { id: DrawerTab; label: string }[] = [
  { id: "pl", label: "損益" },
  { id: "cf", label: "CF" },
  { id: "bs", label: "B/S・株式" },
  { id: "metrics", label: "指標" },
];

export function CompanyDrawer() {
  const d = useDrawer();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!d.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && d.close();
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [d.open, d]);

  const desktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const hidden = desktop ? { x: "100%", y: 0 } : { y: "100%", x: 0 };
  const setTab = (t: DrawerTab) => d.show(d.company, t);
  const setCo = (c: CompanyId | "all") => d.show(c, d.tab);

  return (
    <AnimatePresence>
      {d.open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={d.close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="架空3社の財務データ"
            className="thin-scroll fixed z-[61] flex flex-col overflow-hidden bg-paper shadow-2xl
              inset-x-0 bottom-0 max-h-[86dvh] rounded-t-2xl
              md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(560px,92vw)] md:rounded-none md:rounded-l-2xl"
            initial={hidden}
            animate={{ y: 0, x: 0 }}
            exit={hidden}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 pb-3 pt-3 md:pt-5">
              <div>
                <p className="serif text-[1.1rem] font-extrabold text-ink">架空3社の数字</p>
                <p className="text-[0.76rem] text-muted">第II部の計算はすべてこの表から。実在の企業とは無関係です。</p>
              </div>
              <button ref={closeRef} onClick={d.close} className="rounded-lg p-2 text-muted hover:bg-surface-2" aria-label="閉じる">
                <IconClose />
              </button>
            </div>

            <div className="space-y-2 border-b border-line px-4 py-3">
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="表の種類">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={d.tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3 py-1 text-[0.8rem] transition-colors ${
                      d.tab === t.id ? "bg-ink text-paper" : "bg-surface-2 text-text hover:bg-line"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[0.76rem]">
                <span className="text-muted">強調：</span>
                {(["all", ...companyOrder] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCo(c)}
                    aria-pressed={d.company === c}
                    className={`rounded-md border px-2 py-0.5 transition-colors ${
                      d.company === c ? "border-ink text-ink" : "border-line text-muted hover:text-ink"
                    }`}
                    style={c !== "all" && d.company === c ? { borderColor: companies[c].color, color: companies[c].color } : undefined}
                  >
                    {c === "all" ? "なし" : companies[c].ticker}
                  </button>
                ))}
              </div>
            </div>

            <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4">
              <motion.div key={d.tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                <p className="mb-2 text-[0.8rem] font-bold text-ink">{sheets[d.tab].title}</p>
                <SheetTable tab={d.tab} highlight={d.company} compact />
                {d.tab === "metrics" && (
                  <p className="mt-3 text-[0.74rem] leading-relaxed text-muted">
                    赤字の企業ではPER・PEGなどは算出できないため「―」と表示しています。WACCは本文の仮定値です。
                  </p>
                )}
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
