"use server";

import { prisma } from "@/lib/prisma";
import { verifyManageToken } from "@/lib/manage-token";
import { getAvailability } from "@/lib/availability";
import { logAudit } from "@/lib/audit";

function isFuture(date: string, timeSlot: string): boolean {
  return new Date(`${date}T${timeSlot}:00`).getTime() > Date.now();
}

async function loadByToken(token: string) {
  const id = verifyManageToken(token);
  if (!id) return null;
  return prisma.appointment.findUnique({ where: { id } });
}

export type ManageResult = { ok: true } | { ok: false; error: string };

export async function confirmByToken(token: string): Promise<ManageResult> {
  const appointment = await loadByToken(token);
  if (!appointment) return { ok: false, error: "This link is not valid." };
  if (appointment.status !== "PENDING") {
    return { ok: false, error: "This appointment is already processed." };
  }
  if (!isFuture(appointment.date, appointment.timeSlot)) {
    return { ok: false, error: "This appointment is in the past." };
  }
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CONFIRMED" },
  });
  await logAudit("patient", "appointment.confirm", "Appointment", appointment.id, "via manage link");
  return { ok: true };
}

export async function cancelByToken(token: string): Promise<ManageResult> {
  const appointment = await loadByToken(token);
  if (!appointment) return { ok: false, error: "This link is not valid." };
  if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status)) {
    return { ok: false, error: "This appointment can no longer be cancelled." };
  }
  if (!isFuture(appointment.date, appointment.timeSlot)) {
    return { ok: false, error: "This appointment is in the past." };
  }
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
  });
  await logAudit("patient", "appointment.cancel", "Appointment", appointment.id, "via manage link");
  return { ok: true };
}

export async function getSlotsByToken(
  token: string,
  date: string
): Promise<{ slots: string[]; closed: boolean }> {
  const appointment = await loadByToken(token);
  if (!appointment) return { slots: [], closed: false };
  const availability = await getAvailability({
    date,
    serviceSlug: appointment.serviceSlug,
    dentistId: appointment.dentistId ?? undefined,
    ignoreAppointmentId: appointment.id,
  });
  return {
    slots: availability.closed ? [] : availability.slots.map((s) => s.time),
    closed: availability.closed,
  };
}

export async function rescheduleByToken(
  token: string,
  date: string,
  timeSlot: string
): Promise<ManageResult> {
  const appointment = await loadByToken(token);
  if (!appointment) return { ok: false, error: "This link is not valid." };
  if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(appointment.status)) {
    return { ok: false, error: "This appointment can no longer be changed." };
  }
  if (!isFuture(appointment.date, appointment.timeSlot)) {
    return { ok: false, error: "This appointment is in the past." };
  }

  const availability = await getAvailability({
    date,
    serviceSlug: appointment.serviceSlug,
    dentistId: appointment.dentistId ?? undefined,
    ignoreAppointmentId: appointment.id,
  });
  const slot = availability.slots.find((s) => s.time === timeSlot);
  if (availability.closed || !slot) {
    return { ok: false, error: "That slot is no longer available — please pick another." };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      date,
      timeSlot,
      // Reminder stamps reset so the new date gets its own reminders
      reminder72At: null,
      reminder24At: null,
    },
  });
  await logAudit(
    "patient",
    "appointment.reschedule",
    "Appointment",
    appointment.id,
    `${appointment.date} ${appointment.timeSlot} → ${date} ${timeSlot} (via manage link)`
  );
  return { ok: true };
}
