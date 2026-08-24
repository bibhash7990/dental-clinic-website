// One-off: link pre-Phase-1 appointments (no dentist/patient) to defaults.
import { prisma } from "./client";

async function main() {
  const mitchell = await prisma.dentist.findFirst({
    where: { name: { contains: "Mitchell" } },
  });
  if (!mitchell) throw new Error("Dentist not found");
  const updated = await prisma.appointment.updateMany({
    where: { dentistId: null },
    data: { dentistId: mitchell.id },
  });
  console.log(`assigned ${updated.count} legacy appointments to ${mitchell.name}`);

  // Backfill patient records for appointments without one
  const orphans = await prisma.appointment.findMany({
    where: { patientId: null },
  });
  for (const a of orphans) {
    const phone = a.phone.replace(/[^\d+]/g, "");
    let patient = await prisma.patient.findFirst({ where: { phone } });
    if (!patient) {
      patient = await prisma.patient.create({
        data: { name: a.name, phone, email: a.email.toLowerCase() || null },
      });
    }
    await prisma.appointment.update({
      where: { id: a.id },
      data: { patientId: patient.id },
    });
  }
  console.log(`backfilled ${orphans.length} patient links`);
}

main().finally(() => prisma.$disconnect());
