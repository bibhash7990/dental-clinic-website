import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyManageToken, manageUrl } from "@/lib/manage-token";
import { site } from "@/data/site";

function icsDate(date: string, time: string): string {
  // Floating local time (no TZ suffix) — renders correctly in the patient's zone
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const id = verifyManageToken(token);
  if (!id) return new NextResponse("Not found", { status: 404 });

  const a = await prisma.appointment.findUnique({
    where: { id },
    include: { dentist: { select: { name: true } } },
  });
  if (!a || a.status === "CANCELLED") {
    return new NextResponse("Not found", { status: 404 });
  }

  const endMinutes =
    Number(a.timeSlot.slice(0, 2)) * 60 +
    Number(a.timeSlot.slice(3)) +
    a.durationMin;
  const endTime = `${Math.floor(endMinutes / 60)
    .toString()
    .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

  const address = `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.zip}`;
  const description = [
    `${a.serviceTitle} with ${a.dentist?.name ?? site.name}`,
    `Reference: ${a.reference}`,
    `Manage: ${manageUrl(a.id)}`,
  ].join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Booking//EN`,
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${a.reference}@brightsmile-demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${icsDate(a.date, a.timeSlot)}`,
    `DTEND:${icsDate(a.date, endTime)}`,
    `SUMMARY:${escapeText(`${site.name} — ${a.serviceTitle}`)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(address)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(`Appointment at ${site.name}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${a.reference}.ics"`,
    },
  });
}
