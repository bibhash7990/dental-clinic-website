import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type StaffRole,
  type StaffSession,
} from "@/lib/auth-token";

export async function setSessionCookie(user: {
  userId: string;
  email: string;
  name: string;
  role: StaffRole;
  dentistId: string | null;
}) {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function getSession(): Promise<StaffSession | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

/** Throws unless the current user has one of the given roles. */
export async function requireRole(
  ...roles: StaffRole[]
): Promise<StaffSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (roles.length > 0 && !roles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
