import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Postgres connection string — Neon, Supabase, Vercel Postgres, or a local
    // server. Set it in .env locally and in the Vercel project settings.
    // Prisma 7 no longer reads .env implicitly, hence the dotenv import above.
    url: process.env.DATABASE_URL ?? "",
  },
});
