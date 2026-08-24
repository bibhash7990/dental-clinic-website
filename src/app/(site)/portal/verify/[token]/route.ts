import { NextResponse, type NextRequest } from "next/server";
import {
  consumeMagicLink,
  createPortalSessionToken,
  PORTAL_COOKIE_NAME,
  PORTAL_COOKIE_OPTIONS,
} from "@/lib/portal";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/portal/verify/[token]">
) {
  const { token } = await ctx.params;
  const email = await consumeMagicLink(token);
  if (!email) {
    return NextResponse.redirect(new URL("/portal?expired=1", request.url));
  }
  const response = NextResponse.redirect(new URL("/portal", request.url));
  response.cookies.set(
    PORTAL_COOKIE_NAME,
    createPortalSessionToken(email),
    PORTAL_COOKIE_OPTIONS
  );
  return response;
}
