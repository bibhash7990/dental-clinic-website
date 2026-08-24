import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { PrintButton } from "@/components/admin/print-button";
import { site, formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "Day Sheet",
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  PENDING: "Unconfirmed",
  CONFIRMED: "Confirmed",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

export default async function DaySheetPage(props: PageProps<"/admin/day-sheet">) {
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.date) ? searchParams.date[0] : searchParams.date;
  const date =
    raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : new Date().toISOString().slice(0, 10);

  const appointments = await prisma.appointment.findMany({
    where: { date, status: { notIn: ["CANCELLED"] } },
    orderBy: [{ timeSlot: "asc" }],
    include: { dentist: { select: { name: true } } },
  });

  const longDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Day sheet</h1>
          <p className="text-sm text-muted-foreground">{longDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <form action="/admin/day-sheet" className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={date}
              aria-label="Date"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-lg border border-border bg-background px-4 text-sm font-medium hover:border-primary hover:text-primary"
            >
              Go
            </button>
          </form>
          <PrintButton />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">{site.name} — Day sheet</h1>
        <p className="text-sm">{longDate}</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background print:rounded-none print:border-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th className="px-3 py-2.5 font-semibold">Time</th>
              <th className="px-3 py-2.5 font-semibold">Patient</th>
              <th className="px-3 py-2.5 font-semibold">Phone</th>
              <th className="px-3 py-2.5 font-semibold">Treatment</th>
              <th className="px-3 py-2.5 font-semibold">Dentist</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  No appointments on this day.
                </td>
              </tr>
            ) : (
              appointments.map((a, i) => (
                <tr
                  key={a.id}
                  className={cn("border-b border-border", i % 2 === 1 && "bg-section")}
                >
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold">
                    {formatSlot(a.timeSlot)}
                  </td>
                  <td className="px-3 py-2.5">
                    {a.name}
                    {a.isNewPatient && (
                      <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                        New
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.phone}</td>
                  <td className="px-3 py-2.5">
                    {a.serviceTitle}
                    <span className="text-muted-foreground"> · {a.durationMin}m</span>
                  </td>
                  <td className="px-3 py-2.5">{a.dentist?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {statusLabel[a.status] ?? a.status}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.notes ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground print:mt-8">
        {appointments.length} appointment{appointments.length === 1 ? "" : "s"} ·
        printed from {site.name} admin
      </p>
    </main>
  );
}
