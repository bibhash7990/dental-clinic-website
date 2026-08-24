"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { waitlistSchema, type WaitlistInput } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export type WaitlistResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Public form: "tell me if something opens up sooner". */
export async function joinWaitlist(input: WaitlistInput): Promise<WaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  if (data.latestDate < data.earliestDate) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: { latestDate: "The end date must be after the start date" },
    };
  }

  const service = await prisma.serviceItem.findUnique({
    where: { slug: data.serviceSlug },
    select: { slug: true, title: true, active: true },
  });
  if (!service || !service.active) {
    return { ok: false, error: "Unknown treatment selected." };
  }

  const phone = data.phone.replace(/[^\d+]/g, "");
  const patient = await prisma.patient.findFirst({
    where: { OR: [{ phone }, { email: data.email.toLowerCase() }] },
    select: { id: true },
  });

  const duplicate = await prisma.waitlistEntry.findFirst({
    where: {
      status: { in: ["ACTIVE", "NOTIFIED"] },
      email: data.email.toLowerCase(),
      serviceSlug: data.serviceSlug,
    },
    select: { id: true },
  });
  if (duplicate) {
    return {
      ok: false,
      error: "You're already on the waitlist for this treatment — we'll be in touch.",
    };
  }

  const entry = await prisma.waitlistEntry.create({
    data: {
      patientId: patient?.id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone,
      serviceSlug: service.slug,
      serviceTitle: service.title,
      dentistId: data.dentistId === "any" ? null : data.dentistId,
      earliestDate: data.earliestDate,
      latestDate: data.latestDate,
      preference: data.preference,
      notes: data.notes || null,
    },
  });
  await logAudit("patient", "waitlist.join", "WaitlistEntry", entry.id, service.title);
  revalidatePath("/admin/waitlist");
  return { ok: true };
}
