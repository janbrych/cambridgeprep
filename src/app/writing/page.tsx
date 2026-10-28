import { listWritingPrompts } from "@/lib/exercises";
import { listWritingSubmissions } from "@/lib/store";
import { LinkCard, Pill } from "@/components/Card";
import type { Level } from "@/lib/types";

const TASK_TYPE_LABELS: Record<string, string> = {
  essay: "Essay",
  email: "Email / letter",
  report: "Report",
  review: "Review",
  proposal: "Proposal",
};

export default async function WritingPage() {
  const [prompts, submissions] = await Promise.all([
    listWritingPrompts(),
    listWritingSubmissions(),
  ]);

  const submissionCountByPrompt = new Map<string, number>();
  const feedbackCountByPrompt = new Map<string, number>();
  for (const s of submissions) {
    submissionCountByPrompt.set(
      s.promptId,
      (submissionCountByPrompt.get(s.promptId) ?? 0) + 1
    );
    if (s.feedback) {
      feedbackCountByPrompt.set(
        s.promptId,
        (feedbackCountByPrompt.get(s.promptId) ?? 0) + 1
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Writing</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {prompts.length} prompts. Part 1 is always an essay; Part 2 is a
          choice of email, report, review or proposal.
        </p>
      </div>

      {(["C1", "C2"] as Level[]).map((level) => {
        const levelPrompts = prompts.filter((p) => p.level === level);
        if (levelPrompts.length === 0) return null;
        return (
          <section key={level} className="flex flex-col gap-3">
            <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
              {level} ({levelPrompts[0].wordCountRange[0]}-
              {levelPrompts[0].wordCountRange[1]} words)
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {levelPrompts.map((p) => {
                const submitted = submissionCountByPrompt.get(p.id) ?? 0;
                const reviewed = feedbackCountByPrompt.get(p.id) ?? 0;
                return (
                  <LinkCard
                    key={p.id}
                    href={`/writing/${p.id}`}
                    title={p.title}
                    description={TASK_TYPE_LABELS[p.taskType]}
                    meta={
                      <div className="flex items-center gap-1.5">
                        <Pill>{TASK_TYPE_LABELS[p.taskType]}</Pill>
                        {submitted > 0 && (
                          <Pill tone={reviewed > 0 ? "success" : "warning"}>
                            {reviewed > 0 ? "feedback ready" : "awaiting feedback"}
                          </Pill>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
