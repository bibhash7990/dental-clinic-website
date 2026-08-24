// Dev utility: mint a patient-portal magic link without waiting for the email.
// Usage: npx tsx --env-file=.env scripts/portal-link.ts patient@example.com
import { createHash, randomBytes } from "crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  const email = (process.argv[2] ?? "").toLowerCase();
  if (!email) {
    console.error("usage: tsx scripts/portal-link.ts <email>");
    process.exit(1);
  }
  const token = randomBytes(32).toString("base64url");
  await prisma.magicLink.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      email,
      expiresAt: new Date(Date.now() + 20 * 60_000),
    },
  });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  console.log(`${base}/portal/verify/${token}`);
}

main().finally(() => prisma.$disconnect());
