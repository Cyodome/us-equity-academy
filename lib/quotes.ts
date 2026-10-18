// 各章の節のあいだに置く格言。after は直前の節番号（その節の後に表示）。
// source は確認できた出典。一次出典を特定しにくいものは「広く引用される言葉」と明記する。
export type Quote = {
  chapter: string;
  after: string;
  en: string;
  ja: string;
  who: string;
  source: string;
};

export const quotes: Quote[] = [
  {
    chapter: "ch1",
    after: "1-1",
    en: "Behind every stock is a company. Find out what it's doing.",
    ja: "どの株の裏にも企業がある。その企業が何をしているかを調べよ。",
    who: "ピーター・リンチ",
    source: "広く引用される言葉",
  },
  {
    chapter: "ch2",
    after: "2-4",
    en: "Don't look for the needle in the haystack. Just buy the haystack!",
    ja: "干し草の山から針を探すな。干し草の山ごと買え。",
    who: "ジョン・ボーグル",
    source: "『The Little Book of Common Sense Investing』（2007年）",
  },
  {
    chapter: "ch3",
    after: "3-1",
    en: "In the short run, the market is a voting machine but in the long run, it is a weighing machine.",
    ja: "短期的に市場は投票機だが、長期的には計量機である。",
    who: "ベンジャミン・グレアム",
    source: "バフェットが株主への手紙で繰り返し引用",
  },
  {
    chapter: "ch5",
    after: "5-3",
    en: "Price is what you pay; value is what you get.",
    ja: "価格はあなたが払うもの。価値はあなたが手にするもの。",
    who: "ウォーレン・バフェット",
    source: "バークシャー・ハサウェイ株主への手紙（2008年）。グレアムの教えとして紹介",
  },
  {
    chapter: "ch6",
    after: "6-5",
    en: "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.",
    ja: "そこそこの会社をすばらしい価格で買うより、すばらしい会社をそこそこの価格で買うほうがはるかに良い。",
    who: "ウォーレン・バフェット",
    source: "バークシャー・ハサウェイ株主への手紙（1989年）",
  },
  {
    chapter: "ch7",
    after: "7-3",
    en: "The four most dangerous words in investing are: 'This time it's different.'",
    ja: "投資で最も危険な言葉は「今回は違う」である。",
    who: "ジョン・テンプルトン",
    source: "「投資で成功するための16のルール」",
  },
  {
    chapter: "ch8",
    after: "8-5",
    en: "We venture the motto, MARGIN OF SAFETY.",
    ja: "健全な投資の秘訣を一言で表すなら、私たちは「安全域」という標語を掲げる。",
    who: "ベンジャミン・グレアム",
    source: "『賢明なる投資家』第20章",
  },
  {
    chapter: "ch9",
    after: "9-3",
    en: "You only find out who is swimming naked when the tide goes out.",
    ja: "潮が引いて初めて、誰が裸で泳いでいたかがわかる。",
    who: "ウォーレン・バフェット",
    source: "バークシャー・ハサウェイ株主への手紙（2001年）",
  },
  {
    chapter: "ch10",
    after: "10-1",
    en: "Our favorite holding period is forever.",
    ja: "私たちが好む保有期間は「永遠」だ。",
    who: "ウォーレン・バフェット",
    source: "バークシャー・ハサウェイ株主への手紙（1988年）",
  },
  {
    chapter: "ch11",
    after: "11-7",
    en: "Know what you own, and know why you own it.",
    ja: "何を持っているかを知り、なぜ持っているかを知れ。",
    who: "ピーター・リンチ",
    source: "広く引用される言葉",
  },
  {
    chapter: "ch12",
    after: "12-3",
    en: "Risk comes from not knowing what you're doing.",
    ja: "リスクとは、自分が何をしているかを分かっていないことから生まれる。",
    who: "ウォーレン・バフェット",
    source: "広く引用される言葉",
  },
  {
    chapter: "ch13",
    after: "13-6",
    en: "We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.",
    ja: "私たちはただ、他人が強欲なときに恐れ、他人が恐れているときにだけ強欲であろうと努めている。",
    who: "ウォーレン・バフェット",
    source: "バークシャー・ハサウェイ株主への手紙（1986年）",
  },
  {
    chapter: "ch14",
    after: "14-1",
    en: "You can't predict. You can prepare.",
    ja: "予測はできない。備えることはできる。",
    who: "ハワード・マークス",
    source: "オークツリー顧客向けメモの表題（2001年）",
  },
  {
    chapter: "ch15",
    after: "15-4",
    en: "Far more money has been lost by investors preparing for corrections … than has been lost in corrections themselves.",
    ja: "調整局面そのものより、調整に備えようとした投資家が失ったお金のほうがはるかに多い。",
    who: "ピーター・リンチ",
    source: "広く引用される言葉",
  },
];

export function quotesFor(chapter: string) {
  return quotes.filter((q) => q.chapter === chapter);
}
