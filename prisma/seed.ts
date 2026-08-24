import { prisma } from "../scripts/client";
import { hashPassword } from "../src/lib/password";
import { services } from "../src/data/services";

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
    recallMonths: "6",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // Published reviews, so the site and the schema markup aren't empty on day
  // one. Real ones arrive through the post-visit email and need moderating.
  const seedReviews = [
    {
      authorName: "Sarah J.",
      serviceTitle: "Porcelain Veneers",
      rating: 5,
      text: "I put this off for years because I hated the idea of someone touching my front teeth. Dr. Chen talked me through every step and showed me a digital preview first. The veneers look like my own teeth, only the version I wanted.",
      reply:
        "Thank you Sarah — we love hearing this. Enjoy the new smile, and see you at your check-up!",
    },
    {
      authorName: "Michael C.",
      serviceTitle: "Dental Implants",
      rating: 5,
      text: "Two implants, no drama. The clinic ran on time both visits and the aftercare instructions were actually clear. I ate a steak six weeks later.",
      reply: null,
    },
    {
      authorName: "Emma D.",
      serviceTitle: "Invisible Aligners",
      rating: 5,
      text: "Eleven months of aligners and nobody at work noticed I was in treatment. The check-ins were quick and I could message the practice between visits.",
      reply: null,
    },
    {
      authorName: "Priya N.",
      serviceTitle: "Comprehensive Check-ups",
      rating: 4,
      text: "Thorough exam and the hygienist was excellent — genuinely gentle. Docked a star because I waited about fifteen minutes past my slot, but they apologised and explained why.",
      reply:
        "Thanks for the honest feedback Priya — we had an emergency patient that morning. We've since built more buffer into the diary.",
    },
    {
      authorName: "Tom R.",
      serviceTitle: "Emergency Dental Care",
      rating: 5,
      text: "Cracked a molar on a Saturday morning and they fitted me in the same day. Out of pain within an hour of walking through the door.",
      reply: null,
    },
  ];
  for (const r of seedReviews) {
    const exists = await prisma.review.findFirst({
      where: { authorName: r.authorName, appointmentId: null },
    });
    if (!exists) {
      await prisma.review.create({
        data: { ...r, status: "APPROVED", featured: r.rating === 5, moderatedAt: new Date() },
      });
    }
  }

  // Appointment emails are matched case-insensitively nowhere — normalise them
  // so the patient portal finds legacy rows too.
  const mixedCase = await prisma.appointment.findMany({
    select: { id: true, email: true },
  });
  for (const a of mixedCase) {
    if (a.email !== a.email.toLowerCase()) {
      await prisma.appointment.update({
        where: { id: a.id },
        data: { email: a.email.toLowerCase() },
      });
    }
  }

  console.log("Seed complete:");
  console.log(`  services:  ${await prisma.serviceItem.count()}`);
  console.log(`  dentists:  ${await prisma.dentist.count()}`);
  console.log(`  users:     ${await prisma.user.count()}`);
  console.log(`  reviews:   ${await prisma.review.count()}`);
}

main().finally(() => prisma.$disconnect());
