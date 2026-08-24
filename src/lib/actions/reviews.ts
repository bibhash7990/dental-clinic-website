"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/manage-token";
import { reviewSchema, type ReviewInput } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export type ReviewResult =
  | { ok: true; rating: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * A patient rates a completed visit from the link in their thank-you email.
 * Reviews land as PENDING and only appear on the site once a staff member
 * approves them.
 */
export async function submitReview(
  token: string,
  input: ReviewInput
): Promise<ReviewResult> {
  const appointmentId = verifyToken("review", token);
  if (!appointmentId) return { ok: false, error: "This link is not valid." };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, patientId: true, serviceTitle: true, status: true },
  });
  if (!appointment) return { ok: false, error: "This link is not valid." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;

  const existing = await prisma.review.findUnique({
    where: { appointmentId: appointment.id },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "You've already reviewed this visit — thank you!" };
  }

  await prisma.review.create({
    data: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      authorName: data.authorName,
      serviceTitle: appointment.serviceTitle,
      rating: data.rating,
      text: data.text,
    },
  });
  await logAudit(
    "patient",
    "review.create",
    "Appointment",
    appointment.id,
    `${data.rating}★`
  );
  revalidatePath("/admin/reviews");
  return { ok: true, rating: data.rating };
}

export async function hasReviewed(token: string): Promise<boolean> {
  const appointmentId = verifyToken("review", token);
  if (!appointmentId) return false;
  const existing = await prisma.review.findUnique({
    where: { appointmentId },
    select: { id: true },
  });
  return !!existing;
}
