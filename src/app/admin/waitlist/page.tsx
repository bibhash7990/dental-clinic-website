import type { Metadata } from "next";
import Link from "next/link";
import { BellRing } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WaitlistActions } from "@/components/admin/waitlist-actions";

export const metadata: Metadata = {
  title: "Waitlist",
  robots: { index: false, follow: false },
};

const FILTERS = ["ACTIVE", "NOTIFIED", "BOOKED", "CLOSED", "ALL"] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-primary/15 text-primary",
  NOTIFIED: "bg-amber-100 text-amber-800",
  BOOKED: "bg-cta/15 text-cta",
  CLOSED: "bg-muted text-muted-foreground",
};

const PREFERENCE_LABELS: Record<string, string> = {
  ANY: "Any time",
  MORNING: "Mornings",
  AFTERNOON: "Afternoons",
};

export default async function AdminWaitlistPage(
  props: PageProps<"/admin/waitlist">
) {
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;
  const filter = (FILTERS as readonly string[]).includes(raw ?? "")
    ? (raw as string)
    : "ACTIVE";

  const [entries, activeCount, dentists] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where: filter === "ALL" ? {} : { status: filter },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { patient: { select: { id: true } } },
    }),
    prisma.waitlistEntry.count({ where: { status: "ACTIVE" } }),
    prisma.dentist.findMany({ select: { id: true, name: true } }),
  ]);
  const dentistName = new Map(dentists.map((d) => [d.id, d.name]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BellRing className="size-6 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} patient{activeCount === 1 ? "" : "s"} waiting for an
            earlier slot. Cancellations trigger an email automatically.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/waitlist?status=${f}`}
            aria-current={filter === f ? "page" : undefined}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium capitalize",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nobody on this list right now.
            </CardContent>
          </Card>
        ) : (
          entries.map((e) => (
            <Card key={e.id} className="py-0">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {e.patient ? (
                      <Link
                        href={`/admin/patients/${e.patient.id}`}
                        className="text-primary hover:underline"
                      >
                        {e.name}
                      </Link>
                    ) : (
                      e.name
                    )}
                    <Badge className={cn("ml-2", STATUS_STYLES[e.status])}>
                      {e.status.toLowerCase()}
                    </Badge>
                    {e.notifyCount > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        notified {e.notifyCount}×
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {e.serviceTitle} ·{" "}
                    {e.dentistId ? dentistName.get(e.dentistId) ?? "—" : "Any dentist"} ·{" "}
                    {e.earliestDate} → {e.latestDate} ·{" "}
                    {PREFERENCE_LABELS[e.preference] ?? e.preference}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href={`tel:${e.phone.replace(/[^+\d]/g, "")}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {e.phone}
                    </a>{" "}
                    · {e.email}
                  </p>
                  {e.notes && (
                    <p className="mt-1 text-sm italic text-muted-foreground">
                      &ldquo;{e.notes}&rdquo;
                    </p>
                  )}
                </div>
                <WaitlistActions id={e.id} status={e.status} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
