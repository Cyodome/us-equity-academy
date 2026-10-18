"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc-shared";
import { useDrawer, useProgress } from "./Providers";
import { IconBook, IconClose, IconLedger, IconMenu, IconMoon, IconQuiz, IconSun, IconText } from "./Icons";
import { TocList } from "./TocList";

function useUi() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fs, setFs] = useState<"s" | "m" | "l">("m");
  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as "light" | "dark") || "light");
    setFs((document.documentElement.dataset.fs as "s" | "m" | "l") || "m");
  }, []);
  const persist = (patch: Record<string, string>) => {
    try {
      const cur = JSON.parse(localStorage.getItem("uea-ui") || "{}");
      localStorage.setItem("uea-ui", JSON.stringify({ ...cur, ...patch }));
    } catch {}
  };
  return {
    theme,
    fs,
    toggleTheme: () => {
      const t = theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = t;
      setTheme(t);
      persist({ theme: t });
      window.dispatchEvent(new Event("themechange"));
    },
    cycleFs: () => {
      const n = fs === "m" ? "l" : fs === "l" ? "s" : "m";
      document.documentElement.dataset.fs = n;
      setFs(n);
      persist({ fs: n });
    },
  };
}

export function TopBar({ toc }: { toc: TocItem[] }) {
  const pathname = usePathname();
  const ui = useUi();
  const drawer = useDrawer();
  const { store } = useProgress();
  const [menu, setMenu] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const chMatch = pathname.match(/\/chapters\/([^/]+)/);
  const current = chMatch ? toc.find((t) => t.id === chMatch[1]) : null;

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const btn =
    "items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.82rem] text-hero-ink/85 hover:bg-white/10 hover:text-white transition-colors";

  return (
    <>
      <header className="sticky top-0 z-40 bg-hero text-hero-ink border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-3 sm:px-5">
          <button className={`${btn} inline-flex lg:hidden`} onClick={() => setMenu(true)} aria-label="目次を開く">
            <IconMenu />
          </button>
          <Link href="/" className="flex min-w-0 items-baseline gap-2.5">
            <span className="serif whitespace-nowrap text-[0.92rem] font-extrabold tracking-wide text-white sm:text-[1.02rem]">米国株投資 実践教科書</span>
            {current && (
              <span className="hidden truncate text-[0.8rem] text-hero-ink/60 md:inline">
                {current.label}　{current.title}
              </span>
            )}
          </Link>
          <nav className="ml-auto flex items-center gap-0.5" aria-label="主要メニュー">
            <Link href="/chapters/ch1/" className={`${btn} hidden sm:inline-flex`}>
              <IconBook /> 目次
            </Link>
            <button className={`${btn} inline-flex`} onClick={() => drawer.show("all")} aria-label="3社の数字を開く">
              <IconLedger /> <span className="hidden sm:inline">3社の数字</span>
            </button>
            <Link href="/quiz/" className={`${btn} inline-flex`} aria-label="問題">
              <IconQuiz /> <span className="hidden sm:inline">問題</span>
            </Link>
            <button className={`${btn} inline-flex`} onClick={ui.cycleFs} aria-label={`文字サイズ（現在：${ui.fs === "s" ? "小" : ui.fs === "l" ? "大" : "標準"}）`} title="文字サイズを切り替え">
              <IconText />
            </button>
            <button className={`${btn} inline-flex`} onClick={ui.toggleTheme} aria-label={ui.theme === "dark" ? "ライトモードにする" : "ダークモードにする"}>
              {ui.theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
          </nav>
        </div>
        {current && <motion.div className="h-[2px] origin-left bg-amber" style={{ scaleX: bar }} />}
      </header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
            />
            <motion.aside
              className="thin-scroll fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm overflow-y-auto bg-surface p-4 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              aria-label="目次"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="serif text-lg font-extrabold text-ink">目次</span>
                <button className="rounded-lg p-2 text-muted hover:bg-surface-2" onClick={() => setMenu(false)} aria-label="閉じる">
                  <IconClose />
                </button>
              </div>
              <TocList toc={toc} currentId={current?.id} read={store.read} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
