"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useState } from "react";

type Scene = { cap: string; eps: number; per: number; note?: string; tone?: "up" | "down" };
const scenes: Scene[] = [
  { cap: "Apex Retail の今日", eps: 8, per: 15 },
  { cap: "金利が上がり、市場が払う倍率が下がると", eps: 8, per: 13, note: "業績は同じでも ▲13.3%", tone: "down" },
  { cap: "利益が年10%で5年伸びると", eps: 12.88, per: 15, note: "倍率は同じでも ＋61%", tone: "up" },
];

function Num({ v, fmt }: { v: ReturnType<typeof useMotionValue<number>>; fmt: (n: number) => string }) {
  const t = useTransform(v, fmt);
  return <motion.span className="tnum">{t}</motion.span>;
}

export function Hero() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const eps = useMotionValue(8);
  const per = useMotionValue(15);
  const price = useTransform(() => eps.get() * per.get());

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % scenes.length), 4200);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    const s = scenes[i];
    const a = animate(eps, s.eps, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    const b = animate(per, s.per, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [i, eps, per]);

  const s = scenes[i];
  return (
    <div className="relative" aria-label="株価＝EPS×PERの例">
      <motion.p key={s.cap} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-[0.82rem] text-hero-ink/70">
        {s.cap}
      </motion.p>
      <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-end gap-x-3 gap-y-1 sm:gap-x-5">
        <span className="text-[0.75rem] text-hero-ink/60">株価</span>
        <span />
        <span className="text-[0.75rem] text-hero-ink/60">EPS</span>
        <span />
        <span className="text-[0.75rem] text-hero-ink/60">PER</span>
        <span className="serif text-[2.1rem] font-extrabold leading-none text-white sm:text-[3.4rem]">
          <Num v={price as never} fmt={(n) => `$${n.toFixed(2)}`} />
        </span>
        <span className="serif text-[1.6rem] text-amber sm:text-[2.4rem]">＝</span>
        <span className="serif text-[2.1rem] font-extrabold leading-none text-hero-ink sm:text-[3.4rem]">
          <Num v={eps} fmt={(n) => `$${n.toFixed(2)}`} />
        </span>
        <span className="serif text-[1.6rem] text-amber sm:text-[2.4rem]">×</span>
        <span className="serif text-[2.1rem] font-extrabold leading-none text-hero-ink sm:text-[3.4rem]">
          <Num v={per} fmt={(n) => `${n.toFixed(1)}x`} />
        </span>
      </div>
      <div className="mt-4 h-6">
        {s.note && (
          <motion.span
            key={s.note}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className={`inline-block rounded-full px-3 py-0.5 text-[0.8rem] font-bold ${s.tone === "down" ? "bg-[#e34948]/20 text-[#ff9b93]" : "bg-[#2a78d6]/25 text-[#a9cbff]"}`}
          >
            {s.note}
          </motion.span>
        )}
      </div>
      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="例の切り替え">
        {scenes.map((sc, k) => (
          <button
            key={sc.cap}
            role="tab"
            aria-selected={k === i}
            aria-label={sc.cap}
            onClick={() => setI(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-amber" : "w-3 bg-white/25 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
