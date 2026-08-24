import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** RFC 4180 quoting — Excel opens the result without mangling commas. */
function csv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell === null || cell === undefined ? "" : String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(",")
    )
    .join("\r\n");
}

function isoDate(value: string | null, fallback: string): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const type = params.get("type") ?? "appointments";
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const from = isoDate(params.get("from"), monthAgo);
  const to = isoDate(params.get("to"), today);
  const rangeStart = new Date(`${from}T00:00:00`);
  const rangeEnd = new Date(`${to}T23:59:59`);

  let rows: (string | number | null)[][];

  if (type === "patients") {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        appointments: {
          select: { date: true, status: true },
          orderBy: { date: "desc" },
        },
      },
    });
    rows = [
      [
        "Name",
        "Phone",
        "Email",
        "Date of birth",
        "Registered",
        "Total visits",
        "Completed",
        "No-shows",
        "Last visit",
      ],
      ...patients.map((p) => {
        const completed = p.appointments.filter((a) => a.status === "COMPLETED");
        return [
          p.name,
          p.phone,
          p.email,
          p.dateOfBirth,
          p.createdAt.toISOString().slice(0, 10),
          p.appointments.length,
          completed.length,
          p.appointments.filter((a) => a.status === "NO_SHOW").length,
          completed[0]?.date ?? "",
        ];
      }),
    ];
  } else if (type === "reviews") {
    const reviews = await prisma.review.findMany({
      where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
      orderBy: { createdAt: "desc" },
    });
    rows = [
      ["Date", "Author", "Rating", "Treatment", "Status", "Review", "Clinic reply"],
      ...reviews.map((r) => [
        r.createdAt.toISOString().slice(0, 10),
        r.authorName,
        r.rating,
        r.serviceTitle,
        r.status,
        r.text,
        r.reply,
      ]),
    ];
  } else {
    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      include: {
        dentist: { select: { name: true } },
        intakeForm: { select: { status: true } },
      },
    });
    const services = await prisma.serviceItem.findMany({
      select: { slug: true, price: true },
    });
    const priceOf = new Map(services.map((s) => [s.slug, s.price]));
    rows = [
      [
        "Reference",
        "Date",
        "Time",
        "Duration (min)",
        "Patient",
        "Phone",
        "Email",
        "Treatment",
        "List price",
        "Dentist",
        "Status",
        "Booked via",
        "New patient",
        "Intake form",
        "Created",
      ],
      ...appointments.map((a) => [
        a.reference,
        a.date,
        a.timeSlot,
        a.durationMin,
        a.name,
        a.phone,
        a.email,
        a.serviceTitle,
        priceOf.get(a.serviceSlug) ?? 0,
        a.dentist?.name ?? "",
        a.status,
        a.createdBy,
        a.isNewPatient ? "yes" : "no",
        a.intakeForm?.status ?? "",
        a.createdAt.toISOString(),
      ]),
    ];
  }

  const filename = `brightsmile-${type}-${from}-to-${to}.csv`;
  // BOM so Excel detects UTF-8 in names and treatment titles
  return new NextResponse(`﻿${csv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
