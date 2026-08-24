import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.AUTH_SECRET ?? "demo-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", `manage:${secret()}`).update(payload).digest("base64url");
}

/** Stable, no-login token that lets a patient manage one appointment. */
export function createManageToken(appointmentId: string): string {
  return `${appointmentId}.${sign(appointmentId)}`;
}

/** Returns the appointment id, or null if the token is invalid. */
export function verifyManageToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return id;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function manageUrl(appointmentId: string): string {
  return `${siteUrl()}/appointment/${createManageToken(appointmentId)}`;
}
