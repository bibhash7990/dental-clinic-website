import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { services } from "../src/data/services";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

const DURATION_BY_CATEGORY: Record<string, number> = {
  preventive: 45,
  cosmetic: 60,
  restorative: 60,
  surgical: 60,
  orthodontic: 45,
  pediatric: 30,
  periodontal: 60,
  endodontic: 90,
  technology: 30,
};

async function main() {
  // Services from the marketing dataset
  for (const [i, s] of services.entries()) {
    await prisma.serviceItem.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        title: s.title,
        category: s.category,
        durationMin: DURATION_BY_CATEGORY[s.category] ?? 45,
        price: s.priceFrom,
        sortOrder: i,
      },
    });
  }

  // Dentists with staggered schedules. Clinic hours: Mon–Thu 8–18, Fri 8–16, Sat 9–13.
  const dentists = [
    {
      name: "Dr. Sarah Mitchell",
      title: "Lead Dentist",
      color: "#0891B2",
      sortOrder: 0,
      days: [
        { weekday: 1, start: "08:00", end: "18:00" },
        { weekday: 2, start: "08:00", end: "18:00" },
        { weekday: 3, start: "08:00", end: "18:00" },
        { weekday: 4, start: "08:00", end: "18:00" },
        { weekday: 5, start: "08:00", end: "16:00" },
      ],
    },
    {
      name: "Dr. James Chen",
      title: "Oral Surgeon",
      color: "#7C3AED",
      sortOrder: 1,
      days: [
        { weekday: 1, start: "09:00", end: "18:00" },
        { weekday: 2, start: "09:00", end: "18:00" },
        { weekday: 4, start: "09:00", end: "18:00" },
        { weekday: 5, start: "09:00", end: "16:00" },
        { weekday: 6, start: "09:00", end: "13:00" },
      ],
    },
    {
      name: "Dr. Emily Parker",
      title: "Orthodontist",
      color: "#16A34A",
      sortOrder: 2,
      days: [
        { weekday: 2, start: "08:00", end: "18:00" },
        { weekday: 3, start: "08:00", end: "18:00" },
        { weekday: 4, start: "08:00", end: "18:00" },
        { weekday: 5, start: "08:00", end: "16:00" },
        { weekday: 6, start: "09:00", end: "13:00" },
      ],
    },
  ];

  const dentistIds: Record<string, string> = {};
  for (const d of dentists) {
    const existing = await prisma.dentist.findFirst({ where: { name: d.name } });
    if (existing) {
      dentistIds[d.name] = existing.id;
      continue;
    }
    const created = await prisma.dentist.create({
      data: {
        name: d.name,
        title: d.title,
        color: d.color,
        sortOrder: d.sortOrder,
        availability: {
          create: d.days.map((day) => ({
            weekday: day.weekday,
            startTime: day.start,
            endTime: day.end,
          })),
        },
      },
    });
    dentistIds[d.name] = created.id;
  }

  // Staff accounts
  const users = [
    {
      email: "owner@brightsmile.demo",
      name: "Clinic Owner",
      role: "OWNER",
      password: "admin123",
      dentistId: null as string | null,
    },
    {
      email: "desk@brightsmile.demo",
      name: "Front Desk",
      role: "RECEPTIONIST",
      password: "desk123",
      dentistId: null,
    },
    {
      email: "dr.mitchell@brightsmile.demo",
      name: "Dr. Sarah Mitchell",
      role: "DENTIST",
      password: "dentist123",
      dentistId: dentistIds["Dr. Sarah Mitchell"] ?? null,
    },
  ];
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: hashPassword(u.password),
        dentistId: u.dentistId,
      },
    });
  }

  // Booking rules
  const settings: Record<string, string> = {
    slotStepMin: "30",
    minNoticeHours: "12",
    maxAdvanceDays: "90",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log("Seed complete:");
  console.log(`  services:  ${await prisma.serviceItem.count()}`);
  console.log(`  dentists:  ${await prisma.dentist.count()}`);
  console.log(`  users:     ${await prisma.user.count()}`);
}

main().finally(() => prisma.$disconnect());
