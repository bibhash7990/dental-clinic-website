"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/manage-token";
import { intakeSchema, type IntakeInput } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

export type IntakeResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Patient completes their medical history from the secure link. */
export async function submitIntake(
  token: string,
  input: IntakeInput
): Promise<IntakeResult> {
  const limit = await checkRateLimit("intake");
  if (!limit.ok) {
    return { ok: false, error: rateLimitMessage(limit.retryAfterSec) };
  }
  const appointmentId = verifyToken("intake", token);
  if (!appointmentId) return { ok: false, error: "This link is not valid." };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { id: true, patientId: true, status: true },
  });
  if (!appointment) return { ok: false, error: "This link is not valid." };
  if (appointment.status === "CANCELLED") {
    return { ok: false, error: "This appointment has been cancelled." };
  }

  const parsed = intakeSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  await prisma.intakeForm.upsert({
    where: { appointmentId: appointment.id },
    update: {
      status: "COMPLETED",
      data: JSON.stringify(data),
      submittedAt: new Date(),
      patientId: appointment.patientId,
    },
    create: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      status: "COMPLETED",
      data: JSON.stringify(data),
      submittedAt: new Date(),
    },
  });

  // Keep the patient record in step with what they just told us
  if (appointment.patientId && data.dateOfBirth) {
    await prisma.patient.update({
      where: { id: appointment.patientId },
      data: { dateOfBirth: data.dateOfBirth },
    });
  }

  await logAudit("patient", "intake.submit", "Appointment", appointment.id);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
