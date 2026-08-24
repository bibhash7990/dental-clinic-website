// Dev utility: print the Phase 3 patient links (intake, review, portal) so the
// flows can be exercised without waiting for the scheduler to send an email.
import { prisma } from "./client";
import { createToken, siteUrl } from "../src/lib/manage-token";

async function main() {
  const upcoming = await prisma.appointment.findFirst({
    where: { status: { in: ["PENDING", "CONFIRMED"] } },
    orderBy: { date: "asc" },
  });
  const completed = await prisma.appointment.findFirst({
    where: { status: "COMPLETED", review: null },
    orderBy: { date: "desc" },
  });

  if (upcoming) {
    console.log(`upcoming  ${upcoming.reference} ${upcoming.date} ${upcoming.email}`);
    console.log(`  intake  ${siteUrl()}/intake/${createToken("intake", upcoming.id)}`);
    console.log(`  manage  ${siteUrl()}/appointment/${createToken("manage", upcoming.id)}`);
  }
  if (completed) {
    console.log(`completed ${completed.reference} ${completed.date} ${completed.email}`);
    console.log(`  review  ${siteUrl()}/review/${createToken("review", completed.id)}`);
  }

  const emails = await prisma.appointment.findMany({
    distinct: ["email"],
    select: { email: true, name: true },
    take: 10,
  });
  console.log("\nportal emails:", emails.map((e) => e.email).join(", "));

  const counts = {
    appointments: await prisma.appointment.count(),
    intakeForms: await prisma.intakeForm.count(),
    reviews: await prisma.review.count(),
    waitlist: await prisma.waitlistEntry.count(),
    magicLinks: await prisma.magicLink.count(),
  };
  console.log(counts);
}

main().finally(() => prisma.$disconnect());
