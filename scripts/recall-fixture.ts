// Dev utility: create a patient whose last visit was long enough ago to land
// on the recall list, so the campaign can be exercised locally.
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

async function main() {
  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
  const date = eightMonthsAgo.toISOString().slice(0, 10);

  const dentist = await prisma.dentist.findFirst({ orderBy: { sortOrder: "asc" } });
  const existing = await prisma.appointment.findUnique({
    where: { reference: "BSD-RECALL" },
  });
  if (existing) {
    console.log(`BSD-RECALL already exists (${existing.date})`);
    return;
  }

  const patient = await prisma.patient.create({
    data: {
      name: "Nadia Okafor",
      email: "nadia.okafor@example.com",
      phone: "+15550008888",
    },
  });
  await prisma.appointment.create({
    data: {
      reference: "BSD-RECALL",
      patientId: patient.id,
      dentistId: dentist?.id,
      name: patient.name,
      email: patient.email!,
      phone: patient.phone,
      serviceSlug: "comprehensive-checkups",
      serviceTitle: "Comprehensive Check-ups",
      date,
      timeSlot: "10:00",
      durationMin: 45,
      status: "COMPLETED",
      createdBy: "ADMIN",
    },
  });
  console.log(`created BSD-RECALL for ${patient.name} on ${date}`);
}

main().finally(() => prisma.$disconnect());
