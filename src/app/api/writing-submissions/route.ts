import { listWritingSubmissions, saveWritingSubmission } from "@/lib/store";
import type { WritingSubmission } from "@/lib/types";

export async function GET() {
  const submissions = await listWritingSubmissions();
  return Response.json(submissions);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<
    WritingSubmission,
    "id" | "timestamp" | "wordCount"
  >;

  if (
    !body ||
    typeof body.promptId !== "string" ||
    typeof body.text !== "string" ||
    body.text.trim().length === 0
  ) {
    return Response.json(
      { error: "Invalid writing submission payload" },
      { status: 400 }
    );
  }

  const submission = await saveWritingSubmission(body);
  return Response.json(submission, { status: 201 });
}
