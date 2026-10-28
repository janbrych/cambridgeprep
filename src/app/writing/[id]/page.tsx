import { notFound } from "next/navigation";
import Link from "next/link";
import { getWritingPrompt } from "@/lib/exercises";
import { listWritingSubmissions } from "@/lib/store";
import { WritingEditor } from "@/components/exercises/WritingEditor";
import { WritingFeedbackView } from "@/components/exercises/WritingFeedbackView";

export default async function WritingPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [prompt, allSubmissions] = await Promise.all([
    getWritingPrompt(id),
    listWritingSubmissions(),
  ]);
  if (!prompt) notFound();

  const submissions = allSubmissions.filter((s) => s.promptId === id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/writing"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to Writing
      </Link>
      <WritingEditor prompt={prompt} />
      {submissions.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-medium text-zinc-800 dark:text-zinc-200">
            Your previous submissions
          </h2>
          {submissions.map((s) => (
            <WritingFeedbackView key={s.id} submission={s} />
          ))}
        </div>
      )}
    </div>
  );
}
