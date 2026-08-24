import { prisma } from "@/lib/prisma";

export interface BookingSettings {
  slotStepMin: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  bufferMin: number;
}

const SETTING_DEFAULTS: BookingSettings = {
  slotStepMin: 30,
  minNoticeHours: 12,
  maxAdvanceDays: 90,
  bufferMin: 0,
};

export async function getBookingSettings(): Promise<BookingSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    slotStepMin: Number(map.slotStepMin) || SETTING_DEFAULTS.slotStepMin,
    minNoticeHours: Number(map.minNoticeHours) || SETTING_DEFAULTS.minNoticeHours,
    maxAdvanceDays: Number(map.maxAdvanceDays) || SETTING_DEFAULTS.maxAdvanceDays,
    bufferMin: Number(map.bufferMin) >= 0 ? Number(map.bufferMin) : SETTING_DEFAULTS.bufferMin,
  };
}

export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00`).getDay();
}

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "ARRIVED"];

interface Interval {
  start: number;
  end: number;
}

function overlaps(aStart: number, aEnd: number, b: Interval): boolean {
  return aStart < b.end && aEnd > b.start;
}

export interface SlotAvailability {
  time: string; // "HH:mm"
  dentistIds: string[];
}

export interface AvailabilityResult {
  slots: SlotAvailability[];
  closed: boolean;
  closedReason?: string;
}

/**
 * Compute bookable start times for a date + service, optionally restricted to
 * one dentist. A start is available for a dentist when the full service
 * duration fits inside one of their availability windows, without overlapping
 * their existing appointments or any time block.
 */
export async function getAvailability(options: {
  date: string;
  serviceSlug: string;
  dentistId?: string;
  ignoreAppointmentId?: string; // for reschedules
  ignoreMinNotice?: boolean; // admin override
}): Promise<AvailabilityResult> {
  const { date, serviceSlug, dentistId, ignoreAppointmentId, ignoreMinNotice } =
    options;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { slots: [], closed: true };

  const closed = await prisma.closedDate.findUnique({ where: { date } });
  if (closed) {
    return { slots: [], closed: true, closedReason: closed.reason ?? "Closed" };
  }

  const [settings, service, dentists, appointments, blocks] = await Promise.all([
    getBookingSettings(),
    prisma.serviceItem.findUnique({ where: { slug: serviceSlug } }),
    prisma.dentist.findMany({
      where: { active: true, ...(dentistId ? { id: dentistId } : {}) },
      include: { availability: { where: { weekday: weekdayOf(date) } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        date,
        status: { in: ACTIVE_STATUSES },
        ...(ignoreAppointmentId ? { id: { not: ignoreAppointmentId } } : {}),
      },
      select: { dentistId: true, timeSlot: true, durationMin: true },
    }),
    prisma.timeBlock.findMany({ where: { date } }),
  ]);

  const duration = service?.durationMin ?? 45;
  const step = settings.slotStepMin;

  const clinicBlocks: Interval[] = blocks
    .filter((b) => !b.dentistId)
    .map((b) => ({ start: timeToMin(b.startTime), end: timeToMin(b.endTime) }));

  // Earliest bookable moment (min-notice applies to public bookings)
  let notBefore = -1;
  if (!ignoreMinNotice) {
    const earliest = new Date(Date.now() + settings.minNoticeHours * 3600_000);
    const earliestDate = earliest.toISOString().slice(0, 10);
    if (date < earliestDate) return { slots: [], closed: false };
    if (date === earliestDate) {
      notBefore = earliest.getHours() * 60 + earliest.getMinutes();
    }
  }

  const byTime = new Map<number, string[]>();

  for (const dentist of dentists) {
    if (dentist.availability.length === 0) continue;

    const busy: Interval[] = [
      // Existing appointments padded with the configured buffer on both sides
      ...appointments
        .filter((a) => a.dentistId === dentist.id)
        .map((a) => ({
          start: timeToMin(a.timeSlot) - settings.bufferMin,
          end: timeToMin(a.timeSlot) + a.durationMin + settings.bufferMin,
        })),
      ...blocks
        .filter((b) => b.dentistId === dentist.id)
        .map((b) => ({ start: timeToMin(b.startTime), end: timeToMin(b.endTime) })),
      ...clinicBlocks,
    ];

    for (const window of dentist.availability) {
      const winStart = timeToMin(window.startTime);
      const winEnd = timeToMin(window.endTime);
      // Align candidate starts to the step grid from the window start
      for (let start = winStart; start + duration <= winEnd; start += step) {
        if (start <= notBefore) continue;
        if (busy.some((b) => overlaps(start, start + duration, b))) continue;
        const list = byTime.get(start) ?? [];
        list.push(dentist.id);
        byTime.set(start, list);
      }
    }
  }

  const slots = [...byTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([min, ids]) => ({ time: minToTime(min), dentistIds: [...new Set(ids)] }));

  return { slots, closed: false };
}

/** Pick the dentist with the lightest load that day among candidates. */
export async function pickDentist(
  date: string,
  candidateIds: string[]
): Promise<string | null> {
  if (candidateIds.length === 0) return null;
  if (candidateIds.length === 1) return candidateIds[0];
  const counts = await prisma.appointment.groupBy({
    by: ["dentistId"],
    where: { date, dentistId: { in: candidateIds }, status: { in: ACTIVE_STATUSES } },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.dentistId, c._count._all]));
  return [...candidateIds].sort(
    (a, b) => (countMap.get(a) ?? 0) - (countMap.get(b) ?? 0)
  )[0];
}
