"use client";

import { useState } from "react";
import { Pill } from "@/components/Card";
import type { WritingPrompt } from "@/lib/types";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingEditor({ prompt }: { prompt: WritingPrompt }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = countWords(text);
  const [min, max] = prompt.wordCountRange;
  const inRange = wordCount >= min && wordCount <= max;

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/writing-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          level: prompt.level,
          taskType: prompt.taskType,
          text,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setText("");
    } catch {
      setError("Couldn't save this submission. Check the dev server is running and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Pill tone={prompt.level === "C2" ? "info" : "default"}>
            {prompt.level}
          </Pill>
          <h1 className="text-xl font-semibold tracking-tight">{prompt.title}</h1>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
          {prompt.prompt}
        </p>
      </div>

      {saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Saved. Feedback will appear on this page once it&apos;s been reviewed.
          <button
            onClick={() => setSaved(false)}
            className="ml-3 underline"
          >
            Write another attempt
          </button>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="Write your answer here…"
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 text-[15px] leading-7 text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={saving || text.trim().length === 0}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {saving ? "Saving…" : "Save submission"}
            </button>
            <span
              className={`text-sm ${
                inRange
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {wordCount} words (target {min}-{max})
            </span>
            {error && <span className="text-sm text-rose-600">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}
