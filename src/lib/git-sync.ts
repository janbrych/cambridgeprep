import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REPO_DIR = process.cwd();

/**
 * Commits and pushes data/progress/*.json so the scheduled (and
 * webhook-triggered) review routine on GitHub can see it. Best-effort:
 * a save should still succeed locally even if git/network isn't
 * available, so failures here are logged, not thrown.
 */
export async function syncProgressToGitHub(summary: string): Promise<void> {
  try {
    await execFileAsync("git", ["add", "data/progress"], { cwd: REPO_DIR });

    const { stdout: staged } = await execFileAsync(
      "git",
      ["diff", "--cached", "--name-only"],
      { cwd: REPO_DIR }
    );
    if (!staged.trim()) return; // nothing changed (e.g. identical retry)

    await execFileAsync("git", ["commit", "-m", summary], { cwd: REPO_DIR });
    await execFileAsync("git", ["push"], { cwd: REPO_DIR });
  } catch (err) {
    console.warn("[git-sync] Could not sync progress to GitHub:", err);
  }
}
