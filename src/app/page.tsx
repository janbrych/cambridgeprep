import Link from "next/link";
import { listRueExercises, listWritingPrompts } from "@/lib/exercises";
import { listAttempts, listFeedbackLog, listWritingSubmissions } from "@/lib/store";
import { Card, Pill } from "@/components/Card";

export default async function Home() {
  const [exercises, prompts, attempts, submissions, feedback] =
    await Promise.all([
      listRueExercises(),
      listWritingPrompts(),
      listAttempts(),
      listWritingSubmissions(),
      listFeedbackLog(),
    ]);

  const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
  const totalPossible = attempts.reduce((sum, a) => sum + a.maxScore, 0);
  const accuracy =
    totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : null;

  const pendingFeedback = submissions.filter((s) => !s.feedback).length;
  const latestFeedback = feedback[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cambridge C1 / C2 Prep
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Reading &amp; Use of English and Writing practice, with personalised
          feedback from periodic reviews instead of a live AI chatbot.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Exercises attempted
          </p>
          <p className="mt-1 text-2xl font-semibold">{attempts.length}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            out of {exercises.length} available
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Overall accuracy
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {accuracy === null ? "—" : `${accuracy}%`}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            across all attempts
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Writing submissions
          </p>
          <p className="mt-1 text-2xl font-semibold">{submissions.length}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {pendingFeedback} awaiting feedback
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/reading-use-of-english"
          className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <h2 className="font-medium">Reading &amp; Use of English</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {exercises.length} exercises across 7 part types, C1 and C2.
          </p>
        </Link>
        <Link
          href="/writing"
          className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
        >
          <h2 className="font-medium">Writing</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {prompts.length} prompts (essay, email, report, review, proposal).
          </p>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Latest feedback</h2>
          <Link
            href="/progress"
            className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View all
          </Link>
        </div>
        {latestFeedback ? (
          <div className="mt-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(latestFeedback.timestamp).toLocaleDateString()}
            </p>
            <p className="mt-1 text-sm">{latestFeedback.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {latestFeedback.weakAreas.map((area) => (
                <Pill key={area} tone="warning">
                  {area}
                </Pill>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No feedback yet — this fills in once Claude has done its first
            review pass of your attempts and writing submissions.
          </p>
        )}
      </Card>
    </div>
  );
}
