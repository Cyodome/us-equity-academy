type P = { className?: string };
const base = "h-[1.15em] w-[1.15em] shrink-0";
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IconMenu = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 6h16M4 12h16M4 18h10" /></svg>
);
export const IconClose = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconLedger = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);
export const IconQuiz = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 17h.01" /></svg>
);
export const IconBook = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20" /></svg>
);
export const IconSun = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const IconMoon = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
export const IconCheck = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconArrowL = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconArrowR = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M9 5l7 7-7 7" /></svg>
);
export const IconSearch = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
);
export const IconText = ({ className = base }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...s} aria-hidden><path d="M4 18L9 6l5 12M5.8 14h6.4M15 18l3-7 3 7M15.9 16h4.2" /></svg>
);
