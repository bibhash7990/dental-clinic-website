// Sets a staff account's password. Use this instead of leaving seeded demo
// passwords in place on any deployment that is publicly reachable.
//   npx tsx --env-file=.env scripts/set-staff-password.ts owner@brightsmile.demo 'new-password'
import { prisma } from "./client";
import { hashPassword } from "../src/lib/password";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error(
      "usage: tsx scripts/set-staff-password.ts <email> <password>"
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Refusing: use at least 12 characters.");
    process.exit(1);
  }
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash: hashPassword(password) },
    select: { email: true, name: true, role: true },
  });
  console.log(`updated ${user.email} (${user.role})`);
}

main().finally(() => prisma.$disconnect());
