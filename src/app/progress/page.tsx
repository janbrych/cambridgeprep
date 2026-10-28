import { RUE_PARTS } from "@/lib/exercises";
import { listAttempts, listFeedbackLog, listWritingSubmissions } from "@/lib/store";
import { Card, Pill } from "@/components/Card";
import { WritingFeedbackView } from "@/components/exercises/WritingFeedbackView";
import type { RueEPart } from "@/lib/types";

export default async function ProgressPage() {
  const [attempts, submissions, feedback] = await Promise.all([
    listAttempts(),
    listWritingSubmissions(),
    listFeedbackLog(),
  ]);

  const byPart = new Map<RueEPart, { score: number; maxScore: number; count: number }>();
  for (const a of attempts) {
    const existing = byPart.get(a.part) ?? { score: 0, maxScore: 0, count: 0 };
    existing.score += a.score;
    existing.maxScore += a.maxScore;
    existing.count += 1;
    byPart.set(a.part, existing);
  }

  const flaggedAttempts = attempts.filter(
    (a) => a.flaggedForReview && a.flaggedForReview.length > 0
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Progress &amp; Feedback
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Auto-scored results from Reading &amp; Use of English feed into this
          dashboard immediately. Writing feedback and the notes below appear
          after a periodic review pass.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
          Reading &amp; Use of English accuracy by part
        </h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No attempts yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RUE_PARTS.map((part) => {
              const stats = byPart.get(part.key);
              if (!stats) return null;
              const pct = Math.round((stats.score / stats.maxScore) * 100);
              return (
                <Card key={part.key}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{part.label}</p>
                    <Pill tone={pct >= 70 ? "success" : pct >= 50 ? "warning" : "default"}>
                      {pct}%
                    </Pill>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {stats.score}/{stats.maxScore} correct over {stats.count} attempt
                    {stats.count === 1 ? "" : "s"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {flaggedAttempts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
            Flagged for review
          </h2>
          <Card>
            <ul className="flex flex-col gap-2 text-sm">
              {flaggedAttempts.map((a) => (
                <li key={a.id}>
                  <span className="font-medium">{a.exerciseId}</span> — questions{" "}
                  {a.flaggedForReview!.join(", ")}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
          Writing submissions
        </h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No submissions yet.
          </p>
        ) : (
          submissions.map((s) => <WritingFeedbackView key={s.id} submission={s} />)
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
          Feedback log
        </h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No review entries yet — these appear after each periodic check-in.
          </p>
        ) : (
          feedback.map((f) => (
            <Card key={f.id}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(f.timestamp).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm">{f.summary}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Weak areas
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {f.weakAreas.map((a) => (
                      <Pill key={a} tone="warning">
                        {a}
                      </Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Strong areas
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {f.strongAreas.map((a) => (
                      <Pill key={a} tone="success">
                        {a}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
              {f.recommendations.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
                  {f.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
