import { createHmac, timingSafeEqual } from "crypto";

/**
 * Stable, no-login links a patient can act on. Every purpose gets its own HMAC
 * key derivation, so a manage link can never be replayed as an intake or
 * review link.
 */
export type TokenPurpose = "manage" | "intake" | "review";

function secret(): string {
  return process.env.AUTH_SECRET ?? "demo-secret-change-me";
}

function sign(purpose: TokenPurpose, payload: string): string {
  return createHmac("sha256", `${purpose}:${secret()}`)
    .update(payload)
    .digest("base64url");
}

export function createToken(purpose: TokenPurpose, id: string): string {
  return `${id}.${sign(purpose, id)}`;
}

/** Returns the signed id, or null if the token is invalid. */
export function verifyToken(
  purpose: TokenPurpose,
  token: string | undefined
): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(purpose, id);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return id;
}

export const createManageToken = (appointmentId: string) =>
  createToken("manage", appointmentId);
export const verifyManageToken = (token: string | undefined) =>
  verifyToken("manage", token);

/**
 * Absolute base for links that travel in email. Set NEXT_PUBLIC_SITE_URL to
 * your real domain; the Vercel values are a fallback so preview and first
 * deploys still produce working links.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}

export function manageUrl(appointmentId: string): string {
  return `${siteUrl()}/appointment/${createManageToken(appointmentId)}`;
}

export function intakeUrl(appointmentId: string): string {
  return `${siteUrl()}/intake/${createToken("intake", appointmentId)}`;
}

export function reviewUrl(appointmentId: string): string {
  return `${siteUrl()}/review/${createToken("review", appointmentId)}`;
}
