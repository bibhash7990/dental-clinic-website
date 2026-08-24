"use server";

import { prisma } from "@/lib/prisma";
import { bookingSchema, type BookingInput } from "@/lib/validation";
import { sendBookingConfirmation } from "@/lib/email";
import {
  getAvailability,
  getBookingSettings,
  pickDentist,
  type SlotAvailability,
} from "@/lib/availability";

export interface PublicDentist {
  id: string;
  name: string;
  title: string | null;
}

export interface PublicService {
  slug: string;
  title: string;
  durationMin: number;
}

export async function getBookingOptions(): Promise<{
  services: PublicService[];
  dentists: PublicDentist[];
  maxAdvanceDays: number;
}> {
  const [services, dentists, settings] = await Promise.all([
    prisma.serviceItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, durationMin: true },
    }),
    prisma.dentist.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, title: true },
    }),
    getBookingSettings(),
  ]);
  return { services, dentists, maxAdvanceDays: settings.maxAdvanceDays };
}

export async function getPublicAvailability(
  date: string,
  serviceSlug: string,
  dentistId: string
): Promise<{ slots: SlotAvailability[]; closed: boolean; closedReason?: string }> {
  return getAvailability({
    date,
    serviceSlug,
    dentistId: dentistId === "any" ? undefined : dentistId,
  });
}

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function makeReference(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BSD-${out}`;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/** Find an existing patient by phone or email, or create one. */
export async function upsertPatient(data: {
  name: string;
  email: string;
  phone: string;
}): Promise<string> {
  const phone = normalizePhone(data.phone);
  const existing = await prisma.patient.findFirst({
    where: {
      OR: [
        { phone },
        ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
      ],
    },
  });
  if (existing) return existing.id;
  const created = await prisma.patient.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase() || null,
      phone,
    },
  });
  return created.id;
}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const service = await prisma.serviceItem.findUnique({
    where: { slug: data.serviceSlug },
  });
  if (!service || !service.active) {
    return { ok: false, error: "Unknown service selected." };
  }

  // Recompute availability server-side — never trust the submitted slot.
  const availability = await getAvailability({
    date: data.date,
    serviceSlug: data.serviceSlug,
    dentistId: data.dentistId === "any" ? undefined : data.dentistId,
  });
  const slot = availability.slots.find((s) => s.time === data.timeSlot);
  if (availability.closed || !slot) {
    return {
      ok: false,
      error: "That time slot is no longer available. Please pick another one.",
      fieldErrors: { timeSlot: "This slot is no longer available" },
    };
  }

  const dentistId = await pickDentist(data.date, slot.dentistIds);
  if (!dentistId) {
    return { ok: false, error: "No dentist is available at that time." };
  }

  const patientId = await upsertPatient(data);
  const reference = makeReference();

  try {
    await prisma.$transaction(async (tx) => {
      const clash = await tx.appointment.findFirst({
        where: {
          date: data.date,
          dentistId,
          status: { in: ["PENDING", "CONFIRMED", "ARRIVED"] },
          timeSlot: data.timeSlot,
        },
        select: { id: true },
      });
      if (clash) throw new Error("SLOT_TAKEN");

      await tx.appointment.create({
        data: {
          reference,
          patientId,
          dentistId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          serviceSlug: service.slug,
          serviceTitle: service.title,
          date: data.date,
          timeSlot: data.timeSlot,
          durationMin: service.durationMin,
          isNewPatient: data.isNewPatient,
          notes: data.notes || null,
          createdBy: "ONLINE",
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_TAKEN") {
      return {
        ok: false,
        error: "That time slot was just booked. Please pick another one.",
        fieldErrors: { timeSlot: "This slot is no longer available" },
      };
    }
    console.error("[booking] create failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  await sendBookingConfirmation({
    name: data.name,
    email: data.email,
    serviceTitle: service.title,
    date: data.date,
    timeSlot: data.timeSlot,
    reference,
  });

  return { ok: true, reference };
}
