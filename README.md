# 米国株投資 実践教科書（US Equity Investing Academy）

米国株の長期投資を、15章＋付録と150問の理解チェックで学ぶ学習サイト。Next.js の静的出力で構築し、Vercel で配信する。

## 主な機能

- 15章＋第II部の前提＋付録（用語集・出典）を章ごとのページで表示
- 架空企業3社（Apex Retail／Nova Cloud／Ironclad Power）の財務諸表を、どのページからでもドロワーで表示。本文の社名をクリックすると開く。第II部の各章には「この章の数字」を常時表示
- 各章10問・計150問の理解チェック（全問解説付き）。章別・ランダム10問・弱点復習・全問の4モード
- 為替・DCF・複利・積立の4つの計算機（スライダーで操作）
- 各章に投資家の格言（出典つき）
- ダークモード、文字サイズ切替、読了・正答の記録（ブラウザの localStorage にのみ保存）
- 旧サイトのハッシュURL（`/#ch3` など）は新しい章ページへ自動転送

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ に静的ファイルを出力
npm run verify   # 本文の数値・問題・図の参照・個人情報の混入を検証
```

## 構成

| パス | 内容 |
|---|---|
| `content/chapters/*.md` | 本文（章ごと）。`{{chart:ID}}` で図、` ```mermaid ` で図解を差し込む |
| `lib/companies.ts` | 架空3社の財務データと派生指標（全ページ共通の単一ソース） |
| `lib/quizzes/` | 150問（`part1.ts`〜`part5.ts`） |
| `lib/quotes.ts` | 各章の格言と出典 |
| `lib/glossary.ts` | 用語集 |
| `lib/finance.ts` | DCF・複利・積立の計算式（図・計算機・検証で共通） |
| `components/charts/` | 図（Recharts／SVG） |
| `scripts/verify.ts` | 検証スクリプト |

## 数値の更新

時点つきの市場データは `content/chapters/ch02.md`（指数）、`ch14.md`（政策金利・物価・雇用・発表カレンダー）、`components/charts/part3.tsx` の `C22`（カレンダー）・`C23`（主要指標）にある。更新したら `npm run verify` と `npm run build` を通してから公開する。

## 注意

本サイトは教育目的の資料であり、特定の金融商品・証券会社の推奨ではない。架空企業3社は実在の企業とは無関係。
