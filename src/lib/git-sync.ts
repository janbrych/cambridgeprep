import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REPO_DIR = process.cwd();

/** Kill any git command that hangs (slow network, credential prompt). */
const GIT_TIMEOUT_MS = 30_000;

function git(...args: string[]) {
  return execFileAsync("git", args, {
    cwd: REPO_DIR,
    timeout: GIT_TIMEOUT_MS,
    // Never wait for an interactive username/password prompt — fail instead.
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
}

// Saves can arrive close together; running two syncs at once would race on
// .git/index.lock, so they're chained one after another.
let queue: Promise<void> = Promise.resolve();

/**
 * Commits and pushes data/progress/*.json so the scheduled (and
 * webhook-triggered) review routine on GitHub can see it. Best-effort:
 * a save should still succeed locally even if git/network isn't
 * available, so failures here are logged, not thrown.
 */
export function syncProgressToGitHub(summary: string): Promise<void> {
  queue = queue.then(() => sync(summary));
  return queue;
}

async function sync(summary: string): Promise<void> {
  try {
    await git("add", "data/progress");

    const { stdout: staged } = await git("diff", "--cached", "--name-only");
    if (staged.trim()) {
      await git("commit", "-m", summary);
    }

    // The review routine pushes feedback to the same branch, so pick up its
    // commits first — otherwise every push is rejected as non-fast-forward.
    try {
      await git("pull", "--rebase", "--autostash");
    } catch (err) {
      await git("rebase", "--abort").catch(() => {});
      throw err;
    }

    // Push whenever we're ahead, not only when this save produced a commit,
    // so commits left behind by an earlier failed push go out too.
    const { stdout: ahead } = await git("rev-list", "--count", "@{u}..HEAD");
    if (Number(ahead.trim()) > 0) {
      await git("push");
    }
  } catch (err) {
    console.warn("[git-sync] Could not sync progress to GitHub:", err);
  }
}
