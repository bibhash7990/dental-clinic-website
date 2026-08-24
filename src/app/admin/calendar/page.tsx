import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/components/admin/calendar-view";

export const metadata: Metadata = {
  title: "Calendar",
  robots: { index: false, follow: false },
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week containing `date`. */
function weekStart(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const shift = (d.getDay() + 6) % 7;
  return addDays(date, -shift);
}

export default async function CalendarPage(props: PageProps<"/admin/calendar">) {
  const searchParams = await props.searchParams;
  const rawDate = Array.isArray(searchParams.date)
    ? searchParams.date[0]
    : searchParams.date;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayISO();
  const view =
    (Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view) ===
    "week"
      ? "week"
      : "day";
  const dentistParam = Array.isArray(searchParams.dentist)
    ? searchParams.dentist[0]
    : searchParams.dentist;

  const dates =
    view === "day"
      ? [date]
      : Array.from({ length: 7 }, (_, i) => addDays(weekStart(date), i));

  const [dentists, appointments, blocks, closedDates, services] =
    await Promise.all([
      prisma.dentist.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { availability: true },
      }),
      prisma.appointment.findMany({
        where: { date: { in: dates }, status: { notIn: ["CANCELLED"] } },
        orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      }),
      prisma.timeBlock.findMany({ where: { date: { in: dates } } }),
      prisma.closedDate.findMany({ where: { date: { in: dates } } }),
      prisma.serviceItem.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: { slug: true, title: true, durationMin: true },
      }),
    ]);

  const selectedDentist =
    dentists.find((d) => d.id === dentistParam)?.id ?? dentists[0]?.id ?? "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <CalendarView
        view={view}
        date={date}
        dates={dates}
        selectedDentistId={selectedDentist}
        dentists={dentists.map((d) => ({
          id: d.id,
          name: d.name,
          title: d.title,
          color: d.color,
          availability: d.availability.map((a) => ({
            weekday: a.weekday,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        }))}
        appointments={appointments.map((a) => ({
          id: a.id,
          reference: a.reference,
          patientId: a.patientId,
          dentistId: a.dentistId,
          name: a.name,
          phone: a.phone,
          serviceTitle: a.serviceTitle,
          serviceSlug: a.serviceSlug,
          date: a.date,
          timeSlot: a.timeSlot,
          durationMin: a.durationMin,
          status: a.status,
          notes: a.notes,
        }))}
        blocks={blocks.map((b) => ({
          id: b.id,
          dentistId: b.dentistId,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          reason: b.reason,
        }))}
        closedDates={closedDates.map((c) => ({ date: c.date, reason: c.reason }))}
        services={services}
      />
    </main>
  );
}
