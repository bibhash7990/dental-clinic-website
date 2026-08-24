// Starts the in-process scheduler when the server boots. In serverless
// deployments this file is inert — use the /api/cron route with Vercel Cron
// (or any external scheduler) instead.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as unknown as { __bsJobsTimer?: ReturnType<typeof setInterval> };
  if (g.__bsJobsTimer) return;

  const { processScheduledJobs } = await import("@/lib/jobs");
  const run = async () => {
    try {
      const result = await processScheduledJobs();
      const total =
        result.reminders72 + result.reminders24 + result.reviewRequests;
      if (total > 0 || result.digestSent) {
        console.log(
          `[jobs] sent ${result.reminders72}×72h + ${result.reminders24}×24h reminders, ` +
            `${result.reviewRequests} review requests${result.digestSent ? ", daily digest" : ""}`
        );
      }
    } catch (err) {
      console.error("[jobs] run failed", err);
    }
  };

  // First run shortly after boot, then every 10 minutes.
  setTimeout(run, 15_000);
  g.__bsJobsTimer = setInterval(run, 10 * 60_000);
  console.log("[jobs] scheduler started (every 10 min)");
}
