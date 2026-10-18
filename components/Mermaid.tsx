"use client";

import { useEffect, useId, useRef, useState } from "react";

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const id = "m" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [err, setErr] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);

  // 画面に近づいてから描画する（初期表示を軽くする）
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.some((e) => e.isIntersecting) && (setVisible(true), io.disconnect()),
      { rootMargin: "400px" }
    );
    io.observe(el);
    const onTheme = () => setTick((t) => t + 1);
    window.addEventListener("themechange", onTheme);
    return () => {
      io.disconnect();
      window.removeEventListener("themechange", onTheme);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: '"IBM Plex Sans JP", sans-serif',
          flowchart: { curve: "basis", htmlLabels: true, padding: 12, nodeSpacing: 28, rankSpacing: 38 },
          themeVariables: {
            fontSize: "13px",
            background: cssVar("--surface"),
            primaryColor: cssVar("--blue-soft"),
            primaryBorderColor: cssVar("--blue"),
            primaryTextColor: cssVar("--ink"),
            secondaryColor: cssVar("--amber-soft"),
            tertiaryColor: cssVar("--surface-2"),
            lineColor: cssVar("--muted"),
            textColor: cssVar("--text"),
            edgeLabelBackground: cssVar("--surface"),
            pie1: cssVar("--blue"),
            pie2: cssVar("--co-apx"),
            pie3: cssVar("--amber"),
            pieTitleTextColor: cssVar("--ink"),
            pieSectionTextColor: "#ffffff",
            pieLegendTextColor: cssVar("--text"),
            pieStrokeColor: cssVar("--surface"),
          },
        });
        const { svg } = await mermaid.render(`${id}-${tick}`, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setErr(false);
        }
      } catch {
        if (!cancelled) setErr(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, code, id, tick]);

  return (
    <figure className="not-prose my-2 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div ref={ref} className="mermaid-box min-h-[120px]" role="img" aria-label="図解">
        {!visible && <div className="h-[160px] animate-pulse rounded-lg bg-surface-2" />}
      </div>
      {err && <pre className="mt-2 whitespace-pre-wrap text-[0.75rem] text-muted">{code}</pre>}
    </figure>
  );
}
