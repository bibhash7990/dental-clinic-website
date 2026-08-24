import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  Download,
  TrendingUp,
  UserPlus,
  UserX,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
];

export default async function ReportsPage(props: PageProps<"/admin/reports">) {
  const searchParams = await props.searchParams;
  const pick = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const validDate = (value: string | undefined) =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;

  const from = validDate(pick("from")) ?? isoDaysAgo(30);
  const to = validDate(pick("to")) ?? todayISO();

  const [appointments, services, dentists, newPatients, reviewAgg] =
    await Promise.all([
      prisma.appointment.findMany({
        where: { date: { gte: from, lte: to } },
        include: { dentist: { select: { id: true, name: true } } },
      }),
      prisma.serviceItem.findMany({ select: { slug: true, price: true } }),
      prisma.dentist.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true },
      }),
      prisma.patient.count({
        where: {
          createdAt: {
            gte: new Date(`${from}T00:00:00`),
            lte: new Date(`${to}T23:59:59`),
          },
        },
      }),
      prisma.review.aggregate({
        where: {
          status: "APPROVED",
          createdAt: {
            gte: new Date(`${from}T00:00:00`),
            lte: new Date(`${to}T23:59:59`),
          },
        },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

  const priceOf = new Map(services.map((s) => [s.slug, s.price]));

  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED");
  const noShows = appointments.filter((a) => a.status === "NO_SHOW");
  const attendedOrMissed = completed.length + noShows.length;
  const noShowRate =
    attendedOrMissed > 0
      ? Math.round((noShows.length / attendedOrMissed) * 1000) / 10
      : 0;
  const revenue = completed.reduce(
    (sum, a) => sum + (priceOf.get(a.serviceSlug) ?? 0),
    0
  );
  const onlineShare =
    appointments.length > 0
      ? Math.round(
          (appointments.filter((a) => a.createdBy === "ONLINE").length /
            appointments.length) *
            100
        )
      : 0;

  const byDentist = dentists
    .map((d) => {
      const rows = completed.filter((a) => a.dentistId === d.id);
      return {
        id: d.id,
        name: d.name,
        count: rows.length,
        revenue: rows.reduce((s, a) => s + (priceOf.get(a.serviceSlug) ?? 0), 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const treatmentMap = new Map<string, { title: string; count: number; revenue: number }>();
  for (const a of completed) {
    const entry = treatmentMap.get(a.serviceSlug) ?? {
      title: a.serviceTitle,
      count: 0,
      revenue: 0,
    };
    entry.count++;
    entry.revenue += priceOf.get(a.serviceSlug) ?? 0;
    treatmentMap.set(a.serviceSlug, entry);
  }
  const byTreatment = [...treatmentMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  const topTreatmentRevenue = byTreatment[0]?.revenue ?? 1;

  const kpis = [
    {
      icon: CalendarRange,
      label: "Appointments booked",
      value: appointments.length.toString(),
      hint: `${onlineShare}% booked online`,
    },
    {
      icon: TrendingUp,
      label: "Revenue (completed)",
      value: money(revenue),
      hint: `${completed.length} completed · ${money(
        completed.length ? revenue / completed.length : 0
      )} average`,
    },
    {
      icon: UserX,
      label: "No-show rate",
      value: `${noShowRate}%`,
      hint: `${noShows.length} missed · ${cancelled.length} cancelled`,
    },
    {
      icon: UserPlus,
      label: "New patients",
      value: newPatients.toString(),
      hint:
        reviewAgg._count._all > 0
          ? `${reviewAgg._count._all} reviews · ${(reviewAgg._avg.rating ?? 0).toFixed(1)}★ average`
          : "No reviews in this period",
    },
  ];

  const exportHref = (type: string) =>
    `/admin/reports/export?type=${type}&from=${from}&to=${to}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-6 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-muted-foreground">
              {from} to {to}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={exportHref("appointments")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="size-4" aria-hidden />
            Appointments CSV
          </a>
          <a
            href={exportHref("patients")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="size-4" aria-hidden />
            Patients CSV
          </a>
          <a
            href={exportHref("reviews")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="size-4" aria-hidden />
            Reviews CSV
          </a>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <div>
          <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="mt-1 block h-9 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="mt-1 block h-9 rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>
        <button type="submit" className={cn(buttonVariants({ size: "sm" }), "h-9")}>
          Apply
        </button>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Link
              key={p.days}
              href={`/admin/reports?from=${isoDaysAgo(p.days)}&to=${todayISO()}`}
              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <kpi.icon className="size-5 text-primary" aria-hidden />
              <p className="mt-3 text-2xl font-bold tabular-nums">{kpi.value}</p>
              <p className="text-sm font-medium">{kpi.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-heading font-bold">Completed visits by dentist</h2>
            {byDentist.every((d) => d.count === 0) ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No completed visits in this period.
              </p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="pb-2 font-semibold">Dentist</th>
                    <th scope="col" className="pb-2 text-right font-semibold">Visits</th>
                    <th scope="col" className="pb-2 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {byDentist.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <th scope="row" className="py-2.5 text-left font-medium">
                        {d.name}
                      </th>
                      <td className="py-2.5 text-right tabular-nums">{d.count}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {money(d.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="font-heading font-bold">Top treatments by revenue</h2>
            {byTreatment.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No completed visits in this period.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {byTreatment.map((t) => (
                  <li key={t.title}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{t.title}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {t.count} × · {money(t.revenue)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-section">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(4, Math.round((t.revenue / topTreatmentRevenue) * 100))}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Revenue is estimated from the list price of completed treatments — it is
        not a substitute for your accounting system.
      </p>
    </main>
  );
}
