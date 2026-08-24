import { NextRequest, NextResponse } from "next/server";
import { processScheduledJobs } from "@/lib/jobs";

// Never cache — every call must actually run the jobs.
export const dynamic = "force-dynamic";
// Sending a batch of emails takes longer than the 10s serverless default.
export const maxDuration = 60;

// External scheduler entry point (Vercel Cron sends `Authorization: Bearer
// $CRON_SECRET` automatically; any other scheduler must send the same header).
// Open in development when no secret is configured.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const result = await processScheduledJobs();
  return NextResponse.json({ ok: true, ...result });
}
