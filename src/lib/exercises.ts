import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Level, RueEExercise, RueEPart, WritingPrompt } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const EXERCISES_DIR = path.join(DATA_DIR, "exercises");
const WRITING_DIR = path.join(DATA_DIR, "writing");

export const RUE_PARTS: { key: RueEPart; label: string }[] = [
  { key: "multiple_choice_cloze", label: "Multiple-choice cloze" },
  { key: "open_cloze", label: "Open cloze" },
  { key: "word_formation", label: "Word formation" },
  { key: "key_word_transformation", label: "Key word transformation" },
  { key: "reading_multiple_choice", label: "Reading: multiple choice" },
  { key: "gapped_text", label: "Reading: gapped text" },
  { key: "multiple_matching", label: "Reading: multiple matching" },
];

export interface RueExerciseMeta {
  id: string;
  level: Level;
  part: RueEPart;
  title: string;
}

async function readJsonFilesIn<T>(dir: string): Promise<T[]> {
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const files = names.filter((n) => n.endsWith(".json"));
  const parsed = await Promise.all(
    files.map(async (name) => {
      const raw = await readFile(path.join(dir, name), "utf-8");
      return JSON.parse(raw) as T;
    })
  );
  return parsed;
}

export async function listRueExercises(): Promise<RueExerciseMeta[]> {
  const all = await Promise.all(
    RUE_PARTS.map((p) =>
      readJsonFilesIn<RueEExercise>(path.join(EXERCISES_DIR, p.key))
    )
  );
  return all
    .flat()
    .map((ex) => ({ id: ex.id, level: ex.level, part: ex.part, title: ex.title }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function getRueExercise(
  id: string
): Promise<RueEExercise | null> {
  for (const p of RUE_PARTS) {
    const items = await readJsonFilesIn<RueEExercise>(
      path.join(EXERCISES_DIR, p.key)
    );
    const found = items.find((ex) => ex.id === id);
    if (found) return found;
  }
  return null;
}

export async function listWritingPrompts(): Promise<WritingPrompt[]> {
  const prompts = await readJsonFilesIn<WritingPrompt>(WRITING_DIR);
  return prompts.sort((a, b) => a.id.localeCompare(b.id));
}

export async function getWritingPrompt(
  id: string
): Promise<WritingPrompt | null> {
  const prompts = await listWritingPrompts();
  return prompts.find((p) => p.id === id) ?? null;
}
