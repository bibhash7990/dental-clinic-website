import { prisma } from "@/lib/prisma";

export interface RecallCandidate {
  patientId: string;
  name: string;
  email: string | null;
  phone: string;
  lastVisit: string;
  lastTreatment: string;
  monthsSince: number;
  recallSentAt: Date | null;
}

/** Months between visits before a patient shows up on the recall list. */
export async function getRecallMonths(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: "recallMonths" } });
  const value = Number(row?.value);
  return value > 0 ? value : 6;
}

const RESEND_AFTER_DAYS = 60;

/**
 * Patients whose last completed visit is older than the recall interval and
 * who have nothing booked. Anyone contacted in the last 60 days, or who opted
 * out, is left off the list.
 */
export async function getRecallDue(months?: number): Promise<RecallCandidate[]> {
  const interval = months ?? (await getRecallMonths());
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - interval);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const resendCutoff = new Date(Date.now() - RESEND_AFTER_DAYS * 86_400_000);

  const patients = await prisma.patient.findMany({
    where: {
      recallOptOut: false,
      appointments: { some: { status: "COMPLETED" } },
    },
    include: {
      appointments: {
        orderBy: [{ date: "desc" }],
        select: { date: true, status: true, serviceTitle: true },
      },
    },
  });

  const due: RecallCandidate[] = [];
  for (const p of patients) {
    const hasUpcoming = p.appointments.some(
      (a) => a.date >= today && ["PENDING", "CONFIRMED"].includes(a.status)
    );
    if (hasUpcoming) continue;

    const lastCompleted = p.appointments.find((a) => a.status === "COMPLETED");
    if (!lastCompleted || lastCompleted.date > cutoffISO) continue;
    if (p.recallSentAt && p.recallSentAt > resendCutoff) continue;

    const monthsSince = Math.max(
      1,
      Math.round(
        (Date.now() - new Date(`${lastCompleted.date}T00:00:00`).getTime()) /
          (30 * 86_400_000)
      )
    );
    due.push({
      patientId: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      lastVisit: lastCompleted.date,
      lastTreatment: lastCompleted.serviceTitle,
      monthsSince,
      recallSentAt: p.recallSentAt,
    });
  }

  return due.sort((a, b) => b.monthsSince - a.monthsSince);
}
