// Dev utility: dump the Phase 3 tables so flows can be verified end to end.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  console.log("--- waitlist");
  console.table(
    (await prisma.waitlistEntry.findMany()).map((w) => ({
      name: w.name,
      service: w.serviceTitle,
      window: `${w.earliestDate}→${w.latestDate}`,
      pref: w.preference,
      status: w.status,
      notified: w.notifyCount,
    }))
  );

  console.log("--- reviews");
  console.table(
    (await prisma.review.findMany({ orderBy: { createdAt: "desc" } })).map((r) => ({
      author: r.authorName,
      rating: r.rating,
      status: r.status,
      featured: r.featured,
      fromVisit: !!r.appointmentId,
    }))
  );

  console.log("--- intake forms");
  console.table(
    (await prisma.intakeForm.findMany()).map((f) => ({
      appointmentId: f.appointmentId.slice(-6),
      status: f.status,
      submitted: f.submittedAt?.toISOString().slice(0, 16) ?? "",
      keys: f.data ? Object.keys(JSON.parse(f.data)).length : 0,
    }))
  );

  console.log("--- magic links");
  console.table(
    (await prisma.magicLink.findMany()).map((m) => ({
      email: m.email,
      used: !!m.usedAt,
      expires: m.expiresAt.toISOString().slice(11, 16),
    }))
  );
}

main().finally(() => prisma.$disconnect());
