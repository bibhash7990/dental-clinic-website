import { NextRequest, NextResponse } from "next/server";
import { processScheduledJobs } from "@/lib/jobs";

// External scheduler entry point (e.g. Vercel Cron). Secured by CRON_SECRET;
// open in development when no secret is configured.
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
