"use client";

import { useMemo, useState } from "react";
import { GappedPassage } from "./GappedPassage";
import { Pill } from "@/components/Card";
import { scoreExercise, type ScoreResult } from "@/lib/scoring";
import type { RueEExercise } from "@/lib/types";

type Phase = "answering" | "reviewed" | "saved";

const inputClass =
  "mx-1 w-32 rounded border border-zinc-300 bg-white px-2 py-0.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const selectClass =
  "mx-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function ExerciseRunner({ exercise }: { exercise: RueEExercise }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("answering");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = useMemo(() => countQuestions(exercise), [exercise]);
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFlag(key: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function checkAnswers() {
    const scored = scoreExercise(exercise, answers);
    setResult(scored);
    setPhase("reviewed");
  }

  async function saveResult() {
    if (!result) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          level: exercise.level,
          part: exercise.part,
          answers,
          score: result.score,
          maxScore: result.maxScore,
          flaggedForReview: Array.from(flagged),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setPhase("saved");
    } catch {
      setError("Couldn't save this attempt. Check the dev server is running and try again.");
    } finally {
      setSaving(false);
    }
  }

  function tryAgain() {
    setAnswers({});
    setResult(null);
    setFlagged(new Set());
    setPhase("answering");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <Pill tone={exercise.level === "C2" ? "info" : "default"}>
            {exercise.level}
          </Pill>
          <h1 className="text-xl font-semibold tracking-tight">{exercise.title}</h1>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {exercise.instructions}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {renderExerciseBody(exercise, answers, setAnswer, result)}
      </div>

      {phase === "answering" && (
        <div className="flex items-center gap-3">
          <button
            onClick={checkAnswers}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Check answers
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
      )}

      {phase !== "answering" && result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-lg font-semibold">
              Score: {result.score}/{result.maxScore}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {result.items.map((item) => {
                const given = answers[item.key] ?? "";
                return (
                  <div
                    key={item.key}
                    className={`rounded-lg border p-3 text-sm ${
                      item.correct
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                        : "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-medium">#{item.key}</span>{" "}
                        {item.correct ? (
                          <span>correct — &ldquo;{given || "—"}&rdquo;</span>
                        ) : (
                          <span>
                            your answer: &ldquo;{given || "—"}&rdquo;, correct answer:{" "}
                            <strong>{item.correctAnswer}</strong>
                          </span>
                        )}
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                          {item.explanation}
                        </p>
                      </div>
                      {phase === "reviewed" && (
                        <label className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <input
                            type="checkbox"
                            checked={flagged.has(item.key)}
                            onChange={() => toggleFlag(item.key)}
                          />
                          flag for review
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {phase === "reviewed" && (
            <div className="flex items-center gap-3">
              <button
                onClick={saveResult}
                disabled={saving}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {saving ? "Saving…" : "Save result"}
              </button>
              <button
                onClick={tryAgain}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Try again
              </button>
              {error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
          )}

          {phase === "saved" && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Saved. This will feed into the next progress review.
              </p>
              <button
                onClick={tryAgain}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Practise again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function countQuestions(exercise: RueEExercise): number {
  switch (exercise.part) {
    case "key_word_transformation":
      return exercise.items.length;
    case "gapped_text":
      return exercise.answers.length;
    case "multiple_matching":
      return exercise.answers.length;
    default:
      return exercise.questions.length;
  }
}

function renderExerciseBody(
  exercise: RueEExercise,
  answers: Record<string, string>,
  setAnswer: (key: string, value: string) => void,
  result: ScoreResult | null
) {
  const disabled = result !== null;

  switch (exercise.part) {
    case "multiple_choice_cloze": {
      const optionsByNumber = new Map(
        exercise.questions.map((q) => [q.number, q.options])
      );
      return (
        <GappedPassage
          passage={exercise.passage}
          renderGap={(num) => {
            const options = optionsByNumber.get(num) ?? [];
            return (
              <select
                className={selectClass}
                disabled={disabled}
                value={answers[String(num)] ?? ""}
                onChange={(e) => setAnswer(String(num), e.target.value)}
              >
                <option value="">({num}) —</option>
                {options.map((opt, i) => (
                  <option key={i} value={String.fromCharCode(65 + i)}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </option>
                ))}
              </select>
            );
          }}
        />
      );
    }

    case "open_cloze": {
      return (
        <GappedPassage
          passage={exercise.passage}
          renderGap={(num) => (
            <input
              className={inputClass}
              disabled={disabled}
              placeholder={`(${num})`}
              value={answers[String(num)] ?? ""}
              onChange={(e) => setAnswer(String(num), e.target.value)}
            />
          )}
        />
      );
    }

    case "word_formation": {
      const rootByNumber = new Map(
        exercise.questions.map((q) => [q.number, q.root])
      );
      return (
        <GappedPassage
          passage={exercise.passage}
          renderGap={(num) => (
            <span className="inline-flex items-center gap-1">
              <input
                className={inputClass}
                disabled={disabled}
                placeholder={`(${num})`}
                value={answers[String(num)] ?? ""}
                onChange={(e) => setAnswer(String(num), e.target.value)}
              />
              <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                {rootByNumber.get(num)}
              </span>
            </span>
          )}
        />
      );
    }

    case "key_word_transformation": {
      return (
        <div className="flex flex-col gap-5">
          {exercise.items.map((item) => (
            <div key={item.number}>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.number}. {item.sentence1}
              </p>
              <p className="mt-1 text-[15px]">
                {item.sentence2Prefix && <span>{item.sentence2Prefix} </span>}
                <input
                  className={inputClass + " w-64"}
                  disabled={disabled}
                  placeholder={item.keyword}
                  value={answers[String(item.number)] ?? ""}
                  onChange={(e) => setAnswer(String(item.number), e.target.value)}
                />
                {item.sentence2Suffix && <span> {item.sentence2Suffix}</span>}
              </p>
              <p className="mt-0.5 text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                {item.keyword}
              </p>
            </div>
          ))}
        </div>
      );
    }

    case "reading_multiple_choice": {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-[15px] leading-7">
            {exercise.passage.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="flex flex-col gap-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            {exercise.questions.map((q) => (
              <div key={q.number}>
                <p className="font-medium">
                  {q.number}. {q.question}
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <label key={letter} className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name={`q-${q.number}`}
                          disabled={disabled}
                          checked={answers[String(q.number)] === letter}
                          onChange={() => setAnswer(String(q.number), letter)}
                          className="mt-1"
                        />
                        <span>
                          {letter}. {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "gapped_text": {
      const letters = exercise.paragraphs.map((p) => p.letter);
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-[15px] leading-7">
            {exercise.passage.split("\n\n").map((block, i) => {
              const gapMatch = block.match(/^\[(\d+)\]$/);
              if (gapMatch) {
                const num = Number(gapMatch[1]);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium">
                    <span>Gap {num}:</span>
                    <select
                      className={selectClass}
                      disabled={disabled}
                      value={answers[String(num)] ?? ""}
                      onChange={(e) => setAnswer(String(num), e.target.value)}
                    >
                      <option value="">—</option>
                      {letters.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return <p key={i}>{block}</p>;
            })}
          </div>
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Paragraphs
            </p>
            {exercise.paragraphs.map((p) => (
              <p key={p.letter} className="text-sm leading-6">
                <strong>{p.letter}.</strong> {p.text}
              </p>
            ))}
          </div>
        </div>
      );
    }

    case "multiple_matching": {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {exercise.sections.map((s) => (
              <div key={s.letter} className="text-[15px] leading-7">
                <p className="font-medium">
                  {s.letter}
                  {s.heading ? ` — ${s.heading}` : ""}
                </p>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
            {exercise.questions.map((q) => (
              <div key={q.number} className="flex items-center gap-2 text-sm">
                <span className="flex-1">
                  {q.number}. Which person {q.question}
                </span>
                <select
                  className={selectClass}
                  disabled={disabled}
                  value={answers[String(q.number)] ?? ""}
                  onChange={(e) => setAnswer(String(q.number), e.target.value)}
                >
                  <option value="">—</option>
                  {exercise.sections.map((s) => (
                    <option key={s.letter} value={s.letter}>
                      {s.letter}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}
