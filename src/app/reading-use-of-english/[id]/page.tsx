import { notFound } from "next/navigation";
import Link from "next/link";
import { getRueExercise } from "@/lib/exercises";
import { ExerciseRunner } from "@/components/exercises/ExerciseRunner";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getRueExercise(id);
  if (!exercise) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/reading-use-of-english"
        className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Back to Reading &amp; Use of English
      </Link>
      <ExerciseRunner exercise={exercise} />
    </div>
  );
}
