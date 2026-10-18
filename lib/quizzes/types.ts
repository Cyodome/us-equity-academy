export type Question = {
  id: string;
  ch: string;
  kind: "concept" | "calc" | "scenario";
  q: string;
  choices: string[];
  a: number;
  why: string;
};

export const kindLabel: Record<Question["kind"], string> = {
  concept: "理解",
  calc: "計算",
  scenario: "判断",
};
