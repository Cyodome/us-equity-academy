"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc-shared";
import { useProgress } from "./Providers";
import { TocList } from "./TocList";
import { LedgerFab, LedgerRail } from "./LedgerRail";
import { chapterRail } from "@/lib/companies";

export function ChapterShell({ toc, chapterId, children }: { toc: TocItem[]; chapterId: string; children: React.ReactNode }) {
  const { store, markRead, setLast } = useProgress();
  const [active, setActive] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const hasRail = !!chapterRail[chapterId];

  useEffect(() => setLast(chapterId), [chapterId, setLast]);

  // 現在読んでいる節を目次で強調する
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("section[data-sec]"));
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [chapterId]);

  // 章末まで読んだら読了にする
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && markRead(chapterId));
    io.observe(el);
    return () => io.disconnect();
  }, [chapterId, markRead]);

  return (
    <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]">
      <aside className="no-print hidden lg:block">
        <nav className="thin-scroll sticky top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto py-6 pr-2" aria-label="目次">
          <TocList toc={toc} currentId={chapterId} read={store.read} activeSection={active} />
        </nav>
      </aside>
      <main id="main" className="min-w-0 py-8">
        {children}
        <div ref={endRef} aria-hidden className="h-px" />
      </main>
      <aside className="no-print hidden xl:block">
        <div className="sticky top-[4.5rem] py-8">{hasRail && <LedgerRail chapter={chapterId} />}</div>
      </aside>
      {hasRail && <LedgerFab />}
    </div>
  );
}
