// Dev utility: print the patient manage URL for the latest appointment.
// Run: npx tsx scripts/manage-url.ts [reference]
import { prisma } from "./client";
import { manageUrl } from "../src/lib/manage-token";

async function main() {
  const ref = process.argv[2];
  const appointment = ref
    ? await prisma.appointment.findUnique({ where: { reference: ref } })
    : await prisma.appointment.findFirst({ orderBy: { createdAt: "desc" } });
  if (!appointment) {
    console.log("no appointment found");
    return;
  }
  console.log(`${appointment.reference} ${appointment.status} ${appointment.date} ${appointment.timeSlot}`);
  console.log(manageUrl(appointment.id));
}

main().finally(() => prisma.$disconnect());
