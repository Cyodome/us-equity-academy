import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import { part5 } from "./part5";
export type { Question } from "./types";
export { kindLabel } from "./types";

export const questions = [...part1, ...part2, ...part3, ...part4, ...part5];

export function questionsFor(ch: string) {
  return questions.filter((q) => q.ch === ch);
}
