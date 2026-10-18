import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TopBar } from "@/components/TopBar";
import { CompanyDrawer } from "@/components/CompanyDrawer";
import { getToc } from "@/lib/content";

export const metadata: Metadata = {
  title: { default: "米国株投資 実践教科書", template: "%s｜米国株投資 実践教科書" },
  description:
    "市場の仕組み・財務指標が株価を動かすメカニズム・板と注文の執行・最初の100万円の運用を、15章と150問の理解チェックで学ぶ米国株投資の実践教科書。",
  openGraph: {
    title: "米国株投資 実践教科書",
    description: "15章＋付録、150問の理解チェック、架空3社の財務諸表でいつでも計算を確かめられる学習サイト。",
    type: "website",
    locale: "ja_JP",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1d38" },
    { media: "(prefers-color-scheme: dark)", color: "#071226" },
  ],
};

// 初回描画前にテーマと文字サイズを反映し、ちらつきを防ぐ
const boot = `(function(){try{var s=JSON.parse(localStorage.getItem('uea-ui')||'{}');var t=s.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;if(s.fs)document.documentElement.dataset.fs=s.fs;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const toc = getToc();
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
            本文へ移動
          </a>
          <TopBar toc={toc} />
          {children}
          <CompanyDrawer />
        </Providers>
      </body>
    </html>
  );
}
