"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CompanyId } from "@/lib/companies";

// ───────── 学習記録（この端末のブラウザにだけ保存） ─────────
type Answer = { ok: boolean; n: number; t: number };
type Store = {
  read: Record<string, number>;
  answers: Record<string, Answer>;
  last?: string;
  days: string[];
};
const KEY = "uea-v2";
const empty: Store = { read: {}, answers: {}, days: [] };

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw);
    return { ...empty, ...s };
  } catch {
    return empty;
  }
}
function save(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}
const today = () => new Date().toLocaleDateString("sv-SE");

type ProgressApi = {
  ready: boolean;
  store: Store;
  markRead: (ch: string) => void;
  setLast: (ch: string) => void;
  answer: (qid: string, ok: boolean) => void;
  reset: () => void;
  streak: number;
};
const ProgressCtx = createContext<ProgressApi | null>(null);

// ───────── 3社の数字ドロワー ─────────
export type DrawerTab = "pl" | "cf" | "bs" | "metrics";
type DrawerApi = {
  open: boolean;
  company: CompanyId | "all";
  tab: DrawerTab;
  show: (company?: CompanyId | "all", tab?: DrawerTab) => void;
  close: () => void;
};
const DrawerCtx = createContext<DrawerApi | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = load();
    const d = today();
    if (!s.days.includes(d)) s.days = [...s.days.slice(-400), d];
    setStore(s);
    save(s);
    setReady(true);
  }, []);

  const update = useCallback((fn: (s: Store) => Store) => {
    setStore((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const streak = useMemo(() => {
    const set = new Set(store.days);
    let n = 0;
    const d = new Date();
    if (!set.has(d.toLocaleDateString("sv-SE"))) d.setDate(d.getDate() - 1);
    while (set.has(d.toLocaleDateString("sv-SE"))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [store.days]);

  const progress: ProgressApi = useMemo(
    () => ({
      ready,
      store,
      streak,
      markRead: (ch) => update((s) => (s.read[ch] ? s : { ...s, read: { ...s.read, [ch]: Date.now() } })),
      setLast: (ch) => update((s) => (s.last === ch ? s : { ...s, last: ch })),
      answer: (qid, ok) =>
        update((s) => {
          const prev = s.answers[qid];
          return { ...s, answers: { ...s.answers, [qid]: { ok, n: (prev?.n ?? 0) + 1, t: Date.now() } } };
        }),
      reset: () => update(() => ({ ...empty, days: [today()] })),
    }),
    [ready, store, streak, update]
  );

  const [drawer, setDrawer] = useState<{ open: boolean; company: CompanyId | "all"; tab: DrawerTab }>({
    open: false,
    company: "all",
    tab: "pl",
  });
  const drawerApi: DrawerApi = useMemo(
    () => ({
      ...drawer,
      show: (company = "all", tab) => setDrawer((d) => ({ open: true, company, tab: tab ?? d.tab })),
      close: () => setDrawer((d) => ({ ...d, open: false })),
    }),
    [drawer]
  );

  return (
    <MotionConfig reducedMotion="user">
      <ProgressCtx.Provider value={progress}>
        <DrawerCtx.Provider value={drawerApi}>{children}</DrawerCtx.Provider>
      </ProgressCtx.Provider>
    </MotionConfig>
  );
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("Providers missing");
  return c;
}
export function useDrawer() {
  const c = useContext(DrawerCtx);
  if (!c) throw new Error("Providers missing");
  return c;
}
