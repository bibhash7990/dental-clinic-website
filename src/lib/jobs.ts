import { prisma } from "@/lib/prisma";
import {
  sendDailyDigest,
  sendReminder,
  sendReviewRequest,
  type AppointmentEmailData,
} from "@/lib/email";
import { formatSlot } from "@/data/site";

function apptDateTime(date: string, timeSlot: string): Date {
  return new Date(`${date}T${timeSlot}:00`);
}

function toEmailData(a: {
  id: string;
  name: string;
  email: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  reference: string;
  status: string;
}): AppointmentEmailData {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    serviceTitle: a.serviceTitle,
    date: a.date,
    timeSlot: a.timeSlot,
    reference: a.reference,
    status: a.status,
  };
}

export interface JobRunResult {
  reminders72: number;
  reminders24: number;
  reviewRequests: number;
  digestSent: boolean;
}

/**
 * Idempotent processor for time-based emails. Safe to call as often as you
 * like (interval locally, Vercel Cron in production) — every send is stamped
 * on the appointment row so nothing goes out twice.
 */
export async function processScheduledJobs(): Promise<JobRunResult> {
  const now = new Date();
  const result: JobRunResult = {
    reminders72: 0,
    reminders24: 0,
    reviewRequests: 0,
    digestSent: false,
  };

  const todayISO = now.toISOString().slice(0, 10);
  const horizon = new Date(now.getTime() + 72 * 3600_000)
    .toISOString()
    .slice(0, 10);

  // ---- Reminders (72h and 24h before start) ----
  const upcoming = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { gte: todayISO, lte: horizon },
    },
    include: { intakeForm: { select: { status: true } } },
  });

  for (const a of upcoming) {
    const startsIn = apptDateTime(a.date, a.timeSlot).getTime() - now.getTime();
    if (startsIn <= 0) continue;
    const hours = startsIn / 3600_000;
    const intakePending = a.intakeForm?.status === "SENT";
    try {
      if (hours <= 24 && !a.reminder24At) {
        await sendReminder({ ...toEmailData(a), intakePending }, "24h");
        await prisma.appointment.update({
          where: { id: a.id },
          data: { reminder24At: now, ...(a.reminder72At ? {} : { reminder72At: now }) },
        });
        result.reminders24++;
      } else if (hours <= 72 && !a.reminder72At) {
        await sendReminder({ ...toEmailData(a), intakePending }, "72h");
        await prisma.appointment.update({
          where: { id: a.id },
          data: { reminder72At: now },
        });
        result.reminders72++;
      }
    } catch (err) {
      console.error(`[jobs] reminder failed for ${a.reference}`, err);
    }
  }

  // ---- Review requests (2h after a completed visit) ----
  const completed = await prisma.appointment.findMany({
    where: { status: "COMPLETED", reviewAskAt: null, date: { lte: todayISO } },
    take: 25,
  });
  for (const a of completed) {
    const endedAgoMs =
      now.getTime() -
      (apptDateTime(a.date, a.timeSlot).getTime() + a.durationMin * 60_000);
    if (endedAgoMs < 2 * 3600_000) continue;
    try {
      await sendReviewRequest(toEmailData(a));
      await prisma.appointment.update({
        where: { id: a.id },
        data: { reviewAskAt: now },
      });
      result.reviewRequests++;
    } catch (err) {
      console.error(`[jobs] review request failed for ${a.reference}`, err);
    }
  }

  // ---- Daily digest to the clinic (first run after 06:00 local) ----
  if (now.getHours() >= 6) {
    const marker = await prisma.setting.findUnique({
      where: { key: "lastDigestDate" },
    });
    if (marker?.value !== todayISO) {
      const todays = await prisma.appointment.findMany({
        where: { date: todayISO, status: { notIn: ["CANCELLED"] } },
        orderBy: { timeSlot: "asc" },
        include: { dentist: { select: { name: true } } },
      });
      try {
        await sendDailyDigest(
          todays.map((a) => ({
            time: formatSlot(a.timeSlot),
            name: a.name,
            phone: a.phone,
            service: a.serviceTitle,
            dentist: a.dentist?.name ?? "—",
            status: a.status.toLowerCase().replace("_", "-"),
          })),
          todayISO
        );
        await prisma.setting.upsert({
          where: { key: "lastDigestDate" },
          update: { value: todayISO },
          create: { key: "lastDigestDate", value: todayISO },
        });
        result.digestSent = true;
      } catch (err) {
        console.error("[jobs] daily digest failed", err);
      }
    }
  }

  return result;
}
