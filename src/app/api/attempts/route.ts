import { listAttempts, saveAttempt } from "@/lib/store";
import type { Attempt } from "@/lib/types";

export async function GET() {
  const attempts = await listAttempts();
  return Response.json(attempts);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Omit<Attempt, "id" | "timestamp">;

  if (
    !body ||
    typeof body.exerciseId !== "string" ||
    typeof body.score !== "number" ||
    typeof body.maxScore !== "number" ||
    typeof body.answers !== "object"
  ) {
    return Response.json({ error: "Invalid attempt payload" }, { status: 400 });
  }

  const attempt = await saveAttempt(body);
  return Response.json(attempt, { status: 201 });
}
