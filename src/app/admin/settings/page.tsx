import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  ServicesPanel,
  HoursPanel,
  ClosedDatesPanel,
  TimeBlocksPanel,
  StaffPanel,
  BookingRulesPanel,
} from "@/components/admin/settings-panels";
import { Card, CardContent } from "@/components/ui/card";
import { getBookingSettings } from "@/lib/availability";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const isOwner = session.role === "OWNER";

  const [services, dentists, closedDates, timeBlocks, staff, audit] =
    await Promise.all([
      prisma.serviceItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.dentist.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { availability: { orderBy: [{ weekday: "asc" }] } },
      }),
      prisma.closedDate.findMany({ orderBy: { date: "asc" } }),
      prisma.timeBlock.findMany({
        where: { date: { gte: new Date().toISOString().slice(0, 10) } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: { dentist: { select: { name: true } } },
      }),
      isOwner
        ? prisma.user.findMany({ orderBy: { createdAt: "asc" } })
        : Promise.resolve([]),
      isOwner
        ? prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 })
        : Promise.resolve([]),
    ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Clinic configuration — changes apply to the booking engine immediately.
      </p>

      <div className="mt-6 space-y-8">
        <ClosedDatesPanel
          closedDates={closedDates.map((c) => ({
            id: c.id,
            date: c.date,
            reason: c.reason,
          }))}
        />
        <TimeBlocksPanel
          dentists={dentists.map((d) => ({ id: d.id, name: d.name }))}
          blocks={timeBlocks.map((b) => ({
            id: b.id,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            reason: b.reason,
            dentistName: b.dentist?.name ?? "Whole clinic",
          }))}
        />
        {isOwner && (
          <>
            <BookingRulesPanel settings={await getBookingSettings()} />
            <ServicesPanel
              services={services.map((s) => ({
                id: s.id,
                title: s.title,
                category: s.category,
                durationMin: s.durationMin,
                price: s.price,
                active: s.active,
              }))}
            />
            <HoursPanel
              dentists={dentists.map((d) => ({
                id: d.id,
                name: d.name,
                availability: d.availability.map((a) => ({
                  weekday: a.weekday,
                  startTime: a.startTime,
                  endTime: a.endTime,
                })),
              }))}
            />
            <StaffPanel
              staff={staff.map((u) => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                active: u.active,
              }))}
            />
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold">Recent activity</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {audit.length === 0 ? (
                    <li>No activity recorded yet.</li>
                  ) : (
                    audit.map((entry) => (
                      <li key={entry.id} className="flex flex-wrap gap-x-2">
                        <span className="font-medium text-foreground">
                          {entry.userEmail}
                        </span>
                        <span>{entry.action}</span>
                        {entry.detail && <span>· {entry.detail}</span>}
                        <span className="ml-auto text-xs">
                          {entry.createdAt.toLocaleString("en-US")}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
