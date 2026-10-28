import { Card, Pill } from "@/components/Card";
import type { WritingSubmission } from "@/lib/types";

export function WritingFeedbackView({
  submission,
}: {
  submission: WritingSubmission;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(submission.timestamp).toLocaleDateString()} ·{" "}
          {submission.wordCount} words
        </p>
        <Pill tone={submission.feedback ? "success" : "warning"}>
          {submission.feedback ? "Reviewed" : "Awaiting feedback"}
        </Pill>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
          Show submitted text
        </summary>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {submission.text}
        </p>
      </details>

      {submission.feedback && (
        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <p>
            <span className="font-medium">Band impression: </span>
            {submission.feedback.bandImpression}
          </p>
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              Strengths
            </p>
            <ul className="mt-1 list-inside list-disc text-zinc-700 dark:text-zinc-300">
              {submission.feedback.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Areas to improve
            </p>
            <ul className="mt-1 list-inside list-disc text-zinc-700 dark:text-zinc-300">
              {submission.feedback.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          {submission.feedback.lineNotes && submission.feedback.lineNotes.length > 0 && (
            <div>
              <p className="font-medium">Line notes</p>
              <ul className="mt-1 flex flex-col gap-2">
                {submission.feedback.lineNotes.map((note, i) => (
                  <li key={i} className="text-zinc-700 dark:text-zinc-300">
                    <span className="italic">&ldquo;{note.quote}&rdquo;</span> —{" "}
                    {note.comment}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {submission.feedback.rewriteSample && (
            <div>
              <p className="font-medium">Sample rewrite</p>
              <p className="mt-1 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                {submission.feedback.rewriteSample}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
