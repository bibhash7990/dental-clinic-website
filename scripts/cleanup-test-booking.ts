// Removes a test booking and everything attached to it (intake form, review,
// patient record if it has no other visits). Usage:
//   npx tsx --env-file=.env scripts/cleanup-test-booking.ts BSD-XXXXXX
import { prisma } from "./client";

async function main() {
  const reference = process.argv[2];
  if (!reference) {
    console.error("usage: tsx scripts/cleanup-test-booking.ts <reference>");
    process.exit(1);
  }
  const appointment = await prisma.appointment.findUnique({
    where: { reference },
    select: { id: true, patientId: true, name: true },
  });
  if (!appointment) return console.log(`${reference} not found`);

  await prisma.review.deleteMany({ where: { appointmentId: appointment.id } });
  await prisma.intakeForm.deleteMany({ where: { appointmentId: appointment.id } });
  await prisma.auditLog.deleteMany({ where: { entityId: appointment.id } });
  await prisma.appointment.delete({ where: { id: appointment.id } });

  if (appointment.patientId) {
    const remaining = await prisma.appointment.count({
      where: { patientId: appointment.patientId },
    });
    if (remaining === 0) {
      await prisma.patientNote.deleteMany({ where: { patientId: appointment.patientId } });
      await prisma.patient.delete({ where: { id: appointment.patientId } });
      console.log(`removed patient record ${appointment.name}`);
    }
  }
  await prisma.magicLink.deleteMany({ where: { usedAt: { not: null } } });
  console.log(`removed ${reference} and its attachments`);
}

main().finally(() => prisma.$disconnect());
