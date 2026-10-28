export type Level = "C1" | "C2";

export type RueEPart =
  | "multiple_choice_cloze"
  | "open_cloze"
  | "word_formation"
  | "key_word_transformation"
  | "reading_multiple_choice"
  | "gapped_text"
  | "multiple_matching";

export interface McClozeQuestion {
  number: number;
  options: [string, string, string, string];
  answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface McClozeExercise {
  id: string;
  level: Level;
  part: "multiple_choice_cloze";
  title: string;
  instructions: string;
  passage: string; // contains (1)___ (2)___ ... markers
  questions: McClozeQuestion[];
}

export interface OpenClozeQuestion {
  number: number;
  answer: string;
  acceptableAnswers?: string[];
  explanation: string;
}

export interface OpenClozeExercise {
  id: string;
  level: Level;
  part: "open_cloze";
  title: string;
  instructions: string;
  passage: string; // contains (1)___ (2)___ ... markers
  questions: OpenClozeQuestion[];
}

export interface WordFormationQuestion {
  number: number;
  root: string;
  answer: string;
  acceptableAnswers?: string[];
  explanation: string;
}

export interface WordFormationExercise {
  id: string;
  level: Level;
  part: "word_formation";
  title: string;
  instructions: string;
  passage: string; // contains (1)___ (2)___ ... markers
  questions: WordFormationQuestion[];
}

export interface KeyWordTransformationItem {
  number: number;
  sentence1: string;
  keyword: string;
  sentence2Prefix: string; // text before the gap in sentence 2
  sentence2Suffix: string; // text after the gap in sentence 2
  answer: string; // the 3-6 words that fill the gap
  acceptableAnswers?: string[];
  explanation: string;
}

export interface KeyWordTransformationExercise {
  id: string;
  level: Level;
  part: "key_word_transformation";
  title: string;
  instructions: string;
  items: KeyWordTransformationItem[];
}

export interface ReadingMcQuestion {
  number: number;
  question: string;
  options: [string, string, string, string];
  answer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface ReadingMcExercise {
  id: string;
  level: Level;
  part: "reading_multiple_choice";
  title: string;
  instructions: string;
  passage: string;
  questions: ReadingMcQuestion[];
}

export interface GappedTextExercise {
  id: string;
  level: Level;
  part: "gapped_text";
  title: string;
  instructions: string;
  passage: string; // contains [1] [2] ... gap markers where paragraphs were removed
  paragraphs: { letter: string; text: string }[]; // includes one extra distractor paragraph
  answers: { gapNumber: number; letter: string; explanation: string }[];
}

export interface MultipleMatchingQuestion {
  number: number;
  question: string;
}

export interface MultipleMatchingSection {
  letter: string;
  heading?: string;
  text: string;
}

export interface MultipleMatchingExercise {
  id: string;
  level: Level;
  part: "multiple_matching";
  title: string;
  instructions: string;
  sections: MultipleMatchingSection[];
  questions: MultipleMatchingQuestion[];
  answers: { questionNumber: number; letter: string; explanation: string }[];
}

export type RueEExercise =
  | McClozeExercise
  | OpenClozeExercise
  | WordFormationExercise
  | KeyWordTransformationExercise
  | ReadingMcExercise
  | GappedTextExercise
  | MultipleMatchingExercise;

export type WritingTaskType = "essay" | "email" | "report" | "review" | "proposal";

export interface WritingPrompt {
  id: string;
  level: Level;
  taskType: WritingTaskType;
  title: string;
  prompt: string; // full task text as the candidate would see it
  wordCountRange: [number, number];
  notes?: string; // what a strong answer should cover, for later feedback
}

export interface Attempt {
  id: string;
  exerciseId: string;
  level: Level;
  part: RueEPart;
  timestamp: string; // ISO
  answers: Record<string, string>; // key = question/item number as string
  score: number;
  maxScore: number;
  flaggedForReview?: string[]; // question numbers the user disputed
}

export interface WritingSubmission {
  id: string;
  promptId: string;
  level: Level;
  taskType: WritingTaskType;
  timestamp: string; // ISO
  text: string;
  wordCount: number;
  feedback?: WritingFeedback;
}

export interface WritingFeedback {
  timestamp: string; // ISO, when Claude reviewed it
  bandImpression: string; // e.g. "solid C1, borderline C2 on range"
  strengths: string[];
  improvements: string[];
  lineNotes?: { quote: string; comment: string }[];
  rewriteSample?: string;
}

export interface FeedbackLogEntry {
  id: string;
  timestamp: string; // ISO, when Claude did the review
  summary: string;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}
