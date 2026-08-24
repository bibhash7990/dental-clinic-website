import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limiting, counted in Postgres.
 *
 * An in-memory counter is useless on Vercel: each serverless instance keeps its
 * own, so a burst spread across instances slips straight through. The database
 * is the only thing every instance shares.
 */
export interface RateLimitRule {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

export const RATE_LIMITS = {
  booking: { limit: 5, windowSec: 3600 },
  contact: { limit: 5, windowSec: 3600 },
  waitlist: { limit: 3, windowSec: 3600 },
  magicLink: { limit: 5, windowSec: 900 },
  review: { limit: 5, windowSec: 3600 },
  intake: { limit: 10, windowSec: 3600 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/** Best-effort client identity. Vercel always sets x-forwarded-for. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  return ip;
}

export interface RateLimitVerdict {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Consumes one unit of the caller's budget for `action`.
 *
 * Fails open: if the database is unreachable we let the request through rather
 * than blocking real patients from booking.
 */
export async function checkRateLimit(
  action: RateLimitAction,
  identifier?: string
): Promise<RateLimitVerdict> {
  const rule = RATE_LIMITS[action];
  const who = identifier ?? (await clientKey());
  const key = `${action}:${who}`;
  const now = new Date();
  const windowMs = rule.windowSec * 1000;

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, windowStart: now },
        create: { key, count: 1, windowStart: now },
      });
      return { ok: true, retryAfterSec: 0 };
    }

    if (existing.count >= rule.limit) {
      const elapsed = now.getTime() - existing.windowStart.getTime();
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((windowMs - elapsed) / 1000)),
      };
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { ok: true, retryAfterSec: 0 };
  } catch (err) {
    console.error(`[rate-limit] check failed for ${key}`, err);
    return { ok: true, retryAfterSec: 0 };
  }
}

export function rateLimitMessage(retryAfterSec: number): string {
  const minutes = Math.ceil(retryAfterSec / 60);
  return minutes <= 1
    ? "Too many attempts — please wait a minute and try again."
    : `Too many attempts — please try again in about ${minutes} minutes, or call us and we'll help right away.`;
}

/**
 * A bot filling the hidden field is the cheapest signal there is. Callers
 * should pretend the submission succeeded rather than say why it failed.
 */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
