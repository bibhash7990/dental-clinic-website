"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, requireRole, setSessionCookie } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getAvailability, pickDentist } from "@/lib/availability";
import { notifyWaitlistForOpening } from "@/lib/waitlist";
import { sendRecallReminder } from "@/lib/email";
import type { StaffRole } from "@/lib/auth-token";

// ---------- Auth ----------

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Please enter your email and password." };
  }
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    return { error: "Incorrect email or password." };
  }
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as StaffRole,
    dentistId: user.dentistId,
  });
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

// ---------- Appointments ----------

const VALID_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export async function updateAppointmentStatus(id: string, status: string) {
  const session = await requireRole();
  if (!VALID_STATUSES.includes(status)) throw new Error("Invalid status");
  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  await logAudit(session.email, "appointment.status", "Appointment", id, status);
  if (status === "CANCELLED") {
    await notifyWaitlistForOpening({
      date: updated.date,
      timeSlot: updated.timeSlot,
      dentistId: updated.dentistId,
    });
  }
  revalidatePath("/admin", "layout");
}

export interface AdminBookingInput {
  patientId?: string;
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  dentistId: string; // "any" or id
  date: string;
  timeSlot: string;
  notes?: string;
  override?: boolean; // skip availability check (squeeze-in)
}

export type AdminBookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

function makeReference(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BSD-${out}`;
}

export async function createAdminAppointment(
  input: AdminBookingInput
): Promise<AdminBookingResult> {
  const session = await requireRole("OWNER", "RECEPTIONIST");

  if (!input.name.trim() || !input.phone.trim()) {
    return { ok: false, error: "Patient name and phone are required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.timeSlot)) {
    return { ok: false, error: "Please choose a valid date and time." };
  }
  const service = await prisma.serviceItem.findUnique({
    where: { slug: input.serviceSlug },
  });
  if (!service) return { ok: false, error: "Please choose a treatment." };

  let dentistId: string | null =
    input.dentistId === "any" ? null : input.dentistId;

  if (!input.override) {
    const availability = await getAvailability({
      date: input.date,
      serviceSlug: input.serviceSlug,
      dentistId: dentistId ?? undefined,
      ignoreMinNotice: true,
    });
    const slot = availability.slots.find((s) => s.time === input.timeSlot);
    if (availability.closed || !slot) {
      return {
        ok: false,
        error:
          "That slot is not available. Tick “override schedule rules” to book it anyway.",
      };
    }
    dentistId = await pickDentist(input.date, slot.dentistIds);
  } else if (!dentistId) {
    return { ok: false, error: "Pick a specific dentist when overriding." };
  }

  // Link or create patient record
  let patientId = input.patientId ?? null;
  if (!patientId) {
    const phone = input.phone.replace(/[^\d+]/g, "");
    const existing = await prisma.patient.findFirst({ where: { phone } });
    patientId = existing
      ? existing.id
      : (
          await prisma.patient.create({
            data: {
              name: input.name.trim(),
              email: input.email.trim().toLowerCase() || null,
              phone,
            },
          })
        ).id;
  }

  const reference = makeReference();
  const appointment = await prisma.appointment.create({
    data: {
      reference,
      patientId,
      dentistId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      serviceSlug: service.slug,
      serviceTitle: service.title,
      date: input.date,
      timeSlot: input.timeSlot,
      durationMin: service.durationMin,
      notes: input.notes?.trim() || null,
      status: "CONFIRMED", // phone bookings are confirmed on the spot
      createdBy: "ADMIN",
    },
  });
  await logAudit(
    session.email,
    "appointment.create",
    "Appointment",
    appointment.id,
    `${input.date} ${input.timeSlot} ${service.title}${input.override ? " (override)" : ""}`
  );
  revalidatePath("/admin", "layout");
  return { ok: true, reference };
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  timeSlot: string,
  newDentistId?: string
): Promise<AdminBookingResult> {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return { ok: false, error: "Appointment not found." };

  const targetDentist = newDentistId ?? appointment.dentistId ?? undefined;
  const availability = await getAvailability({
    date,
    serviceSlug: appointment.serviceSlug,
    dentistId: targetDentist,
    ignoreAppointmentId: id,
    ignoreMinNotice: true,
  });
  const slot = availability.slots.find((s) => s.time === timeSlot);
  if (availability.closed || !slot) {
    return { ok: false, error: "That slot is not available." };
  }
  const dentistId = targetDentist ?? (await pickDentist(date, slot.dentistIds));

  await prisma.appointment.update({
    where: { id },
    data: { date, timeSlot, dentistId, status: "CONFIRMED" },
  });
  await logAudit(
    session.email,
    "appointment.reschedule",
    "Appointment",
    id,
    `${appointment.date} ${appointment.timeSlot} → ${date} ${timeSlot}`
  );
  revalidatePath("/admin", "layout");
  return { ok: true, reference: appointment.reference };
}

// ---------- Patients ----------

export async function searchPatients(query: string) {
  await requireRole();
  const q = query.trim();
  if (q.length < 2) return [];
  return prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q.replace(/[^\d+]/g, "") || q } },
        { email: { contains: q.toLowerCase(), mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, email: true },
  });
}

export async function addPatientNote(patientId: string, text: string) {
  const session = await requireRole();
  if (!text.trim()) return;
  await prisma.patientNote.create({
    data: { patientId, authorName: session.name, text: text.trim() },
  });
  revalidatePath(`/admin/patients/${patientId}`);
}

export async function updatePatient(
  patientId: string,
  data: { name: string; phone: string; email: string; dateOfBirth: string }
) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      name: data.name.trim(),
      phone: data.phone.replace(/[^\d+]/g, ""),
      email: data.email.trim().toLowerCase() || null,
      dateOfBirth: data.dateOfBirth || null,
    },
  });
  await logAudit(session.email, "patient.update", "Patient", patientId);
  revalidatePath(`/admin/patients/${patientId}`);
}

// ---------- Settings: services ----------

export async function saveService(data: {
  id?: string;
  title: string;
  category: string;
  durationMin: number;
  price: number;
  active: boolean;
}) {
  const session = await requireRole("OWNER");
  const duration = Math.max(15, Math.min(240, Math.round(data.durationMin)));
  if (data.id) {
    await prisma.serviceItem.update({
      where: { id: data.id },
      data: {
        title: data.title.trim(),
        category: data.category.trim(),
        durationMin: duration,
        price: Math.max(0, Math.round(data.price)),
        active: data.active,
      },
    });
    await logAudit(session.email, "service.update", "ServiceItem", data.id, data.title);
  } else {
    const slug = data.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const created = await prisma.serviceItem.create({
      data: {
        slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
        title: data.title.trim(),
        category: data.category.trim() || "general",
        durationMin: duration,
        price: Math.max(0, Math.round(data.price)),
        active: data.active,
        sortOrder: 999,
      },
    });
    await logAudit(session.email, "service.create", "ServiceItem", created.id, data.title);
  }
  revalidatePath("/admin/settings");
  revalidatePath("/pricing");
}

// ---------- Settings: availability ----------

export async function saveDentistHours(
  dentistId: string,
  rules: { weekday: number; startTime: string; endTime: string }[]
) {
  const session = await requireRole("OWNER");
  const valid = rules.filter(
    (r) =>
      r.weekday >= 0 &&
      r.weekday <= 6 &&
      /^\d{2}:\d{2}$/.test(r.startTime) &&
      /^\d{2}:\d{2}$/.test(r.endTime) &&
      r.startTime < r.endTime
  );
  await prisma.$transaction([
    prisma.availabilityRule.deleteMany({ where: { dentistId } }),
    prisma.availabilityRule.createMany({
      data: valid.map((r) => ({ ...r, dentistId })),
    }),
  ]);
  await logAudit(session.email, "hours.update", "Dentist", dentistId);
  revalidatePath("/admin/settings");
}

export async function addClosedDate(date: string, reason: string) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  await prisma.closedDate.upsert({
    where: { date },
    update: { reason: reason.trim() || null },
    create: { date, reason: reason.trim() || null },
  });
  await logAudit(session.email, "closedDate.add", "ClosedDate", date, reason);
  revalidatePath("/admin/settings");
}

export async function removeClosedDate(id: string) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  await prisma.closedDate.delete({ where: { id } });
  await logAudit(session.email, "closedDate.remove", "ClosedDate", id);
  revalidatePath("/admin/settings");
}

export async function addTimeBlock(data: {
  dentistId: string; // "" = whole clinic
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    !/^\d{2}:\d{2}$/.test(data.startTime) ||
    !/^\d{2}:\d{2}$/.test(data.endTime) ||
    data.startTime >= data.endTime
  ) {
    return;
  }
  await prisma.timeBlock.create({
    data: {
      dentistId: data.dentistId || null,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason.trim() || null,
    },
  });
  await logAudit(session.email, "timeBlock.add", "TimeBlock", data.date);
  revalidatePath("/admin/settings");
}

export async function removeTimeBlock(id: string) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  await prisma.timeBlock.delete({ where: { id } });
  await logAudit(session.email, "timeBlock.remove", "TimeBlock", id);
  revalidatePath("/admin/settings");
}

// ---------- Follow-ups ----------

export async function markFollowedUp(id: string, undo = false) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  await prisma.appointment.update({
    where: { id },
    data: { followedUpAt: undo ? null : new Date() },
  });
  await logAudit(session.email, "appointment.followup", "Appointment", id, undo ? "undone" : "handled");
  revalidatePath("/admin/follow-ups");
}

// ---------- Settings: booking rules ----------

export async function saveBookingSettings(data: {
  slotStepMin: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  bufferMin: number;
}) {
  const session = await requireRole("OWNER");
  const entries: [string, number][] = [
    ["slotStepMin", Math.min(Math.max(Math.round(data.slotStepMin), 10), 120)],
    ["minNoticeHours", Math.min(Math.max(Math.round(data.minNoticeHours), 0), 168)],
    ["maxAdvanceDays", Math.min(Math.max(Math.round(data.maxAdvanceDays), 1), 365)],
    ["bufferMin", Math.min(Math.max(Math.round(data.bufferMin), 0), 60)],
  ];
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  await logAudit(session.email, "settings.bookingRules", "Setting", "booking-rules");
  revalidatePath("/admin/settings");
}

// ---------- Settings: staff (owner only) ----------

export async function saveStaffUser(data: {
  id?: string;
  email: string;
  name: string;
  role: string;
  password?: string;
  active: boolean;
}) {
  const session = await requireRole("OWNER");
  const { hashPassword } = await import("@/lib/password");
  if (!["OWNER", "RECEPTIONIST", "DENTIST"].includes(data.role)) return;
  if (data.id) {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        role: data.role,
        active: data.active,
        ...(data.password ? { passwordHash: hashPassword(data.password) } : {}),
      },
    });
    await logAudit(session.email, "staff.update", "User", data.id, data.email);
  } else {
    if (!data.password) return;
    const created = await prisma.user.create({
      data: {
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        role: data.role,
        passwordHash: hashPassword(data.password),
        active: data.active,
      },
    });
    await logAudit(session.email, "staff.create", "User", created.id, data.email);
  }
  revalidatePath("/admin/settings");
}

// ---------- Calendar data ----------

export async function getAdminAvailability(
  date: string,
  serviceSlug: string,
  dentistId?: string,
  ignoreAppointmentId?: string
) {
  await requireRole();
  return getAvailability({
    date,
    serviceSlug,
    dentistId: dentistId === "any" || !dentistId ? undefined : dentistId,
    ignoreAppointmentId,
    ignoreMinNotice: true,
  });
}

// ---------- Reviews (Phase 3) ----------

export async function moderateReview(
  id: string,
  action: "APPROVE" | "REJECT" | "PENDING" | "FEATURE" | "UNFEATURE"
) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  const data =
    action === "FEATURE"
      ? { featured: true }
      : action === "UNFEATURE"
        ? { featured: false }
        : {
            status:
              action === "APPROVE"
                ? "APPROVED"
                : action === "REJECT"
                  ? "REJECTED"
                  : "PENDING",
            moderatedAt: new Date(),
            ...(action === "APPROVE" ? {} : { featured: false }),
          };
  await prisma.review.update({ where: { id }, data });
  await logAudit(session.email, "review.moderate", "Review", id, action);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function replyToReview(id: string, reply: string) {
  const session = await requireRole("OWNER", "RECEPTIONIST");
  await prisma.review.update({
    where: { id },
    data: { reply: reply.trim() || null },
  });
  await logAudit(session.email, "review.reply", "Review", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

// ---------- Recall (Phase 3) ----------

export async function sendRecall(patientId: string) {
  const session = await requireRole();
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      appointments: {
        where: { status: "COMPLETED" },
        orderBy: { date: "desc" },
        take: 1,
        select: { date: true },
      },
    },
  });
  if (!patient?.email) return { ok: false as const, error: "No email on file." };

  const lastVisit = patient.appointments[0]?.date;
  const monthsSince = lastVisit
    ? Math.max(
        1,
        Math.round(
          (Date.now() - new Date(`${lastVisit}T00:00:00`).getTime()) /
            (30 * 86_400_000)
        )
      )
    : 6;

  await sendRecallReminder({
    name: patient.name,
    email: patient.email,
    monthsSince,
  });
  await prisma.patient.update({
    where: { id: patientId },
    data: { recallSentAt: new Date() },
  });
  await logAudit(session.email, "recall.send", "Patient", patientId, `${monthsSince}mo`);
  revalidatePath("/admin/recall");
  return { ok: true as const };
}

export async function setRecallOptOut(patientId: string, optOut: boolean) {
  const session = await requireRole();
  await prisma.patient.update({
    where: { id: patientId },
    data: { recallOptOut: optOut },
  });
  await logAudit(
    session.email,
    "recall.optout",
    "Patient",
    patientId,
    optOut ? "opted out" : "re-enabled"
  );
  revalidatePath("/admin/recall");
}

// ---------- Waitlist (Phase 3) ----------

export async function setWaitlistStatus(id: string, status: string) {
  const session = await requireRole();
  if (!["ACTIVE", "NOTIFIED", "BOOKED", "CLOSED"].includes(status)) {
    throw new Error("Invalid status");
  }
  await prisma.waitlistEntry.update({ where: { id }, data: { status } });
  await logAudit(session.email, "waitlist.status", "WaitlistEntry", id, status);
  revalidatePath("/admin/waitlist");
}
