import { prisma } from "@/lib/prisma";
import { getAvailability } from "@/lib/availability";
import { sendWaitlistOpening } from "@/lib/email";

const MAX_NOTIFIED_PER_OPENING = 3;

function bandOf(timeSlot: string): "MORNING" | "AFTERNOON" {
  return Number(timeSlot.slice(0, 2)) < 12 ? "MORNING" : "AFTERNOON";
}

/**
 * A slot freed up on `date` — tell the people waiting for one.
 *
 * Candidates are filtered by their date window, preferred dentist and time of
 * day, then each is re-checked against the live availability engine so we only
 * email someone if their own treatment actually fits the gap.
 */
export async function notifyWaitlistForOpening(opening: {
  date: string;
  timeSlot: string;
  dentistId?: string | null;
}): Promise<number> {
  const band = bandOf(opening.timeSlot);
  const candidates = await prisma.waitlistEntry.findMany({
    where: {
      status: "ACTIVE",
      earliestDate: { lte: opening.date },
      latestDate: { gte: opening.date },
      preference: { in: ["ANY", band] },
      ...(opening.dentistId
        ? { OR: [{ dentistId: null }, { dentistId: opening.dentistId }] }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  let notified = 0;
  for (const entry of candidates) {
    if (notified >= MAX_NOTIFIED_PER_OPENING) break;
    try {
      const availability = await getAvailability({
        date: opening.date,
        serviceSlug: entry.serviceSlug,
        dentistId: entry.dentistId ?? undefined,
        ignoreMinNotice: true,
      });
      const fits = availability.slots.some(
        (s) => entry.preference === "ANY" || bandOf(s.time) === entry.preference
      );
      if (availability.closed || !fits) continue;

      const slot =
        availability.slots.find(
          (s) => entry.preference === "ANY" || bandOf(s.time) === entry.preference
        ) ?? availability.slots[0];

      await sendWaitlistOpening({
        name: entry.name,
        email: entry.email,
        serviceTitle: entry.serviceTitle,
        date: opening.date,
        timeSlot: slot.time,
      });
      await prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: {
          status: "NOTIFIED",
          notifiedAt: new Date(),
          notifyCount: { increment: 1 },
        },
      });
      notified++;
    } catch (err) {
      console.error(`[waitlist] notify failed for ${entry.id}`, err);
    }
  }
  return notified;
}
