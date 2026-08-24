import { createHmac, timingSafeEqual } from "crypto";

const SESSION_HOURS = 12;

export type StaffRole = "OWNER" | "RECEPTIONIST" | "DENTIST";

export interface StaffSession {
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
  dentistId: string | null;
  exp: number;
}

function secret(): string {
  return process.env.AUTH_SECRET ?? "demo-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(
  user: Omit<StaffSession, "exp">
): string {
  const session: StaffSession = {
    ...user,
    exp: Date.now() + SESSION_HOURS * 3600_000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(
  token: string | undefined
): StaffSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    ) as StaffSession;
    if (!session.exp || session.exp < Date.now()) return null;
    if (!["OWNER", "RECEPTIONIST", "DENTIST"].includes(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = "bs_admin_session";
export const SESSION_MAX_AGE_SECONDS = SESSION_HOURS * 3600;
