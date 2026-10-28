import { RUE_PARTS, listRueExercises } from "@/lib/exercises";
import { listAttempts } from "@/lib/store";
import { LinkCard, Pill } from "@/components/Card";
import type { Level } from "@/lib/types";

export default async function ReadingUseOfEnglishPage() {
  const [exercises, attempts] = await Promise.all([
    listRueExercises(),
    listAttempts(),
  ]);

  const bestScoreByExercise = new Map<string, { score: number; maxScore: number }>();
  for (const a of attempts) {
    const existing = bestScoreByExercise.get(a.exerciseId);
    const pct = a.score / a.maxScore;
    if (!existing || pct > existing.score / existing.maxScore) {
      bestScoreByExercise.set(a.exerciseId, { score: a.score, maxScore: a.maxScore });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Reading &amp; Use of English
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {exercises.length} exercises. Pick a part and level to practise.
        </p>
      </div>

      {RUE_PARTS.map((part) => {
        const partExercises = exercises.filter((e) => e.part === part.key);
        if (partExercises.length === 0) return null;
        return (
          <section key={part.key} className="flex flex-col gap-3">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
              {part.label}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["C1", "C2"] as Level[]).map((level) =>
                partExercises
                  .filter((e) => e.level === level)
                  .map((ex) => {
                    const best = bestScoreByExercise.get(ex.id);
                    return (
                      <LinkCard
                        key={ex.id}
                        href={`/reading-use-of-english/${ex.id}`}
                        title={ex.title}
                        meta={
                          <div className="flex items-center gap-1.5">
                            <Pill tone={level === "C2" ? "info" : "default"}>
                              {level}
                            </Pill>
                            {best && (
                              <Pill tone="success">
                                {best.score}/{best.maxScore}
                              </Pill>
                            )}
                          </div>
                        }
                      />
                    );
                  })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
