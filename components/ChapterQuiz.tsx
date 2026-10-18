"use client";

import { useState } from "react";
import { questionsFor } from "@/lib/quizzes";
import { Quiz } from "./Quiz";

export function ChapterQuiz({ chapterId }: { chapterId: string }) {
  const [round, setRound] = useState(0);
  return <Quiz key={round} questions={questionsFor(chapterId)} title={`第${chapterId.replace("ch", "")}章の理解チェック`} onRestart={() => setRound((r) => r + 1)} />;
}
