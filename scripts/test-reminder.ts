// Dev utility: create a CONFIRMED appointment ~48h from now to exercise the
// 72h reminder, then show reminder stamps for upcoming appointments.
import { prisma } from "./client";

async function main() {
  const target = new Date(Date.now() + 48 * 3600_000);
  const date = target.toISOString().slice(0, 10);

  const dentist = await prisma.dentist.findFirst({ orderBy: { sortOrder: "asc" } });
  const patient = await prisma.patient.findFirst();

  const existing = await prisma.appointment.findUnique({
    where: { reference: "BSD-REMIND" },
  });
  if (!existing) {
    await prisma.appointment.create({
      data: {
        reference: "BSD-REMIND",
        patientId: patient?.id,
        dentistId: dentist?.id,
        name: "Reminder Test",
        email: "bibhash.reactjsdev@gmail.com",
        phone: "+15550001111",
        serviceSlug: "comprehensive-checkups",
        serviceTitle: "Comprehensive Check-ups",
        date,
        timeSlot: "15:00",
        durationMin: 45,
        status: "CONFIRMED",
        createdBy: "ADMIN",
      },
    });
    console.log(`created BSD-REMIND on ${date} 15:00 (~48h out)`);
  } else {
    console.log(`BSD-REMIND exists: ${existing.date} r72=${existing.reminder72At} r24=${existing.reminder24At}`);
  }

  const rows = await prisma.appointment.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] } },
    select: { reference: true, date: true, timeSlot: true, status: true, reminder72At: true, reminder24At: true },
  });
  console.log(JSON.stringify(rows, null, 1));
}

main().finally(() => prisma.$disconnect());
