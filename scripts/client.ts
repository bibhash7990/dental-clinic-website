// Shared Prisma client for the dev/ops scripts in this folder.
// Always run them with `npx tsx --env-file=.env scripts/<name>.ts` — without
// the env file there is no DATABASE_URL and tokens sign with the wrong secret.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Run with: npx tsx --env-file=.env scripts/<name>.ts"
  );
  process.exit(1);
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
