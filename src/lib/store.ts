import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Attempt, FeedbackLogEntry, WritingSubmission } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROGRESS_DIR = path.join(DATA_DIR, "progress");

const ATTEMPTS_FILE = path.join(PROGRESS_DIR, "attempts.json");
const SUBMISSIONS_FILE = path.join(PROGRESS_DIR, "writing-submissions.json");
const FEEDBACK_FILE = path.join(PROGRESS_DIR, "feedback-log.json");

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeJsonArray<T>(filePath: string, data: T[]): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function listAttempts(): Promise<Attempt[]> {
  const attempts = await readJsonArray<Attempt>(ATTEMPTS_FILE);
  return attempts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function saveAttempt(
  attempt: Omit<Attempt, "id" | "timestamp">
): Promise<Attempt> {
  const attempts = await readJsonArray<Attempt>(ATTEMPTS_FILE);
  const full: Attempt = {
    ...attempt,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  attempts.push(full);
  await writeJsonArray(ATTEMPTS_FILE, attempts);
  return full;
}

export async function listWritingSubmissions(): Promise<WritingSubmission[]> {
  const subs = await readJsonArray<WritingSubmission>(SUBMISSIONS_FILE);
  return subs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function saveWritingSubmission(
  submission: Omit<WritingSubmission, "id" | "timestamp" | "wordCount">
): Promise<WritingSubmission> {
  const subs = await readJsonArray<WritingSubmission>(SUBMISSIONS_FILE);
  const wordCount = submission.text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const full: WritingSubmission = {
    ...submission,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    wordCount,
  };
  subs.push(full);
  await writeJsonArray(SUBMISSIONS_FILE, subs);
  return full;
}

export async function listFeedbackLog(): Promise<FeedbackLogEntry[]> {
  const entries = await readJsonArray<FeedbackLogEntry>(FEEDBACK_FILE);
  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
