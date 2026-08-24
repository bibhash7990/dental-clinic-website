"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { clearPortalSession, createMagicLink, MAGIC_LINK_MINUTES } from "@/lib/portal";
import { sendPortalMagicLink } from "@/lib/email";

const emailSchema = z.string().trim().email();

/**
 * Emails a one-time sign-in link. The response never reveals whether the
 * address is on file — that would turn the portal into a patient-lookup oracle.
 */
export async function requestMagicLink(
  _prev: { sent?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ sent?: boolean; error?: string }> {
  const raw = formData.get("email");
  const parsed = emailSchema.safeParse(typeof raw === "string" ? raw : "");
  if (!parsed.success) {
    return { error: "Please enter a valid email address." };
  }
  const email = parsed.data.toLowerCase();

  const known = await prisma.appointment.findFirst({
    where: { email: { equals: email } },
    select: { id: true },
  });

  if (known) {
    try {
      const link = await createMagicLink(email);
      await sendPortalMagicLink(email, link, MAGIC_LINK_MINUTES);
    } catch (err) {
      console.error("[portal] magic link failed", err);
      return { error: "We couldn't send the email just now. Please try again." };
    }
  }

  return { sent: true };
}

export async function portalLogout() {
  await clearPortalSession();
  redirect("/portal");
}
