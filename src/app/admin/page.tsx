import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Clock3, Inbox, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusActions } from "@/components/admin/status-actions";
import { prisma } from "@/lib/prisma";
import { formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-primary/15 text-primary",
  ARRIVED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-cta/15 text-cta",
  CANCELLED: "bg-destructive/10 text-destructive",
  NO_SHOW: "bg-destructive/10 text-destructive",
};

export default async function AdminDashboard(props: PageProps<"/admin">) {
  const searchParams = await props.searchParams;
  const rawStatus = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;
  const statusFilter = STATUS_FILTERS.includes(rawStatus ?? "")
    ? (rawStatus as string)
    : "ALL";

  const today = new Date().toISOString().slice(0, 10);

  const [appointments, todayCount, pendingCount, upcomingCount, messages] =
    await Promise.all([
      prisma.appointment.findMany({
        where: statusFilter === "ALL" ? {} : { status: statusFilter },
        orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
        take: 100,
      }),
      prisma.appointment.count({
        where: { date: today, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({
        where: { date: { gte: today }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const summary = [
    { icon: CalendarDays, label: "Today's appointments", value: todayCount },
    { icon: Clock3, label: "Awaiting confirmation", value: pendingCount },
    { icon: ListChecks, label: "Upcoming (all)", value: upcomingCount },
    { icon: Inbox, label: "Recent messages", value: messages.length },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage appointments and patient messages
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="size-5 text-primary" aria-hidden />
              </span>
              <div>
                <p className="font-heading text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Appointments</h2>
          <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <Link
                key={s}
                href={s === "ALL" ? "/admin" : `/admin?status=${s}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                  statusFilter === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {s.toLowerCase().replace("_", "-")}
              </Link>
            ))}
          </nav>
        </div>

        <Card className="mt-4 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Date &amp; time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No appointments{statusFilter !== "ALL" ? " with this status" : ""} yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">
                        {a.reference}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.phone} · {a.email}
                        </p>
                        {a.isNewPatient && (
                          <Badge variant="secondary" className="mt-1">
                            New patient
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{a.serviceTitle}</TableCell>
                      <TableCell>
                        <p>{a.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSlot(a.timeSlot)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                            statusStyles[a.status] ?? "bg-muted"
                          )}
                        >
                          {a.status.toLowerCase().replace("_", "-")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusActions id={a.id} status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent messages</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            messages.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.email}
                        {m.phone ? ` · ${m.phone}` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary">{m.subject}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {m.message}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {m.createdAt.toLocaleString("en-US")}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
