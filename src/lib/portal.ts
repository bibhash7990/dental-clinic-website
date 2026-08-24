import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/manage-token";

export const PORTAL_COOKIE_NAME = "bs_portal_session";

const SESSION_DAYS = 30;
const LINK_MINUTES = 20;

function secret(): string {
  return process.env.AUTH_SECRET ?? "demo-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", `portal:${secret()}`).update(payload).digest("base64url");
}

interface PortalSession {
  email: string;
  exp: number;
}

export const PORTAL_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
} as const;

export function createPortalSessionToken(email: string): string {
  return createSessionToken(email);
}

function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_DAYS * 86_400_000 })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token: string | undefined): PortalSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as PortalSession;
    if (!session.email || !session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** The email of the signed-in patient, or null. */
export async function getPortalEmail(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(PORTAL_COOKIE_NAME)?.value)?.email ?? null;
}

export async function setPortalSession(email: string) {
  const store = await cookies();
  store.set(PORTAL_COOKIE_NAME, createSessionToken(email), PORTAL_COOKIE_OPTIONS);
}

export async function clearPortalSession() {
  const store = await cookies();
  store.delete(PORTAL_COOKIE_NAME);
}

// ---------------------------------------------------------------------------
// Magic links — single-use, hashed at rest, short lived
// ---------------------------------------------------------------------------

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createMagicLink(email: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.magicLink.create({
    data: {
      tokenHash: hashToken(token),
      email: email.toLowerCase(),
      expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000),
    },
  });
  return `${siteUrl()}/portal/verify/${token}`;
}

/** Consumes a magic link. Returns the email it was issued for, or null. */
export async function consumeMagicLink(token: string): Promise<string | null> {
  const record = await prisma.magicLink.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await prisma.magicLink.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
  return record.email;
}

export const MAGIC_LINK_MINUTES = LINK_MINUTES;
