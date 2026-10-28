import type {
  GappedTextExercise,
  KeyWordTransformationExercise,
  McClozeExercise,
  MultipleMatchingExercise,
  OpenClozeExercise,
  ReadingMcExercise,
  RueEExercise,
  WordFormationExercise,
} from "./types";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]+$/g, "");
}

export function isTextAnswerCorrect(
  given: string,
  answer: string,
  acceptableAnswers?: string[]
): boolean {
  const candidates = [answer, ...(acceptableAnswers ?? [])].map(normalize);
  return candidates.includes(normalize(given));
}

export interface ScoredItem {
  key: string;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  items: ScoredItem[];
}

export function scoreExercise(
  exercise: RueEExercise,
  answers: Record<string, string>
): ScoreResult {
  switch (exercise.part) {
    case "multiple_choice_cloze":
    case "open_cloze":
    case "word_formation":
      return scoreClozeLike(exercise, answers);
    case "key_word_transformation":
      return scoreKeyWordTransformation(exercise, answers);
    case "reading_multiple_choice":
      return scoreReadingMc(exercise, answers);
    case "gapped_text":
      return scoreGappedText(exercise, answers);
    case "multiple_matching":
      return scoreMultipleMatching(exercise, answers);
  }
}

function scoreClozeLike(
  exercise: McClozeExercise | OpenClozeExercise | WordFormationExercise,
  answers: Record<string, string>
): ScoreResult {
  const items: ScoredItem[] = exercise.questions.map((q) => {
    const key = String(q.number);
    const given = answers[key] ?? "";
    const correctAnswer =
      exercise.part === "multiple_choice_cloze" ? q.answer : q.answer;
    const correct =
      exercise.part === "multiple_choice_cloze"
        ? given === q.answer
        : isTextAnswerCorrect(
            given,
            q.answer,
            "acceptableAnswers" in q ? q.acceptableAnswers : undefined
          );
    return { key, correct, correctAnswer, explanation: q.explanation };
  });
  return {
    score: items.filter((i) => i.correct).length,
    maxScore: items.length,
    items,
  };
}

function scoreKeyWordTransformation(
  exercise: KeyWordTransformationExercise,
  answers: Record<string, string>
): ScoreResult {
  const items: ScoredItem[] = exercise.items.map((it) => {
    const key = String(it.number);
    const given = answers[key] ?? "";
    return {
      key,
      correct: isTextAnswerCorrect(given, it.answer, it.acceptableAnswers),
      correctAnswer: it.answer,
      explanation: it.explanation,
    };
  });
  return {
    score: items.filter((i) => i.correct).length,
    maxScore: items.length,
    items,
  };
}

function scoreReadingMc(
  exercise: ReadingMcExercise,
  answers: Record<string, string>
): ScoreResult {
  const items: ScoredItem[] = exercise.questions.map((q) => {
    const key = String(q.number);
    return {
      key,
      correct: (answers[key] ?? "") === q.answer,
      correctAnswer: q.answer,
      explanation: q.explanation,
    };
  });
  return {
    score: items.filter((i) => i.correct).length,
    maxScore: items.length,
    items,
  };
}

function scoreGappedText(
  exercise: GappedTextExercise,
  answers: Record<string, string>
): ScoreResult {
  const items: ScoredItem[] = exercise.answers.map((a) => {
    const key = String(a.gapNumber);
    return {
      key,
      correct: (answers[key] ?? "") === a.letter,
      correctAnswer: a.letter,
      explanation: a.explanation,
    };
  });
  return {
    score: items.filter((i) => i.correct).length,
    maxScore: items.length,
    items,
  };
}

function scoreMultipleMatching(
  exercise: MultipleMatchingExercise,
  answers: Record<string, string>
): ScoreResult {
  const items: ScoredItem[] = exercise.answers.map((a) => {
    const key = String(a.questionNumber);
    return {
      key,
      correct: (answers[key] ?? "") === a.letter,
      correctAnswer: a.letter,
      explanation: a.explanation,
    };
  });
  return {
    score: items.filter((i) => i.correct).length,
    maxScore: items.length,
    items,
  };
}
