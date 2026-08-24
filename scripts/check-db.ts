// Dev utility: print appointments with linked patient + dentist.
// Run: npx tsx scripts/check-db.ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }),
});

async function main() {
  const appointments = await prisma.appointment.findMany({
    select: {
      reference: true,
      name: true,
      date: true,
      timeSlot: true,
      status: true,
      createdBy: true,
      dentist: { select: { name: true } },
      patient: { select: { id: true, name: true } },
    },
  });
  console.log(JSON.stringify(appointments, null, 1));
  const patients = await prisma.patient.count();
  const audit = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { userEmail: true, action: true, detail: true },
  });
  console.log(`patients: ${patients}`);
  console.log("recent audit:", JSON.stringify(audit, null, 1));
}

main().finally(() => prisma.$disconnect());
