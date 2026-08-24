import type { Metadata } from "next";
import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FollowUpActions } from "@/components/admin/follow-up-actions";
import { formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "Follow-ups",
  robots: { index: false, follow: false },
};

export default async function FollowUpsPage() {
  const today = new Date().toISOString().slice(0, 10);

  // No-shows and recent cancellations that were never rebooked or handled
  const candidates = await prisma.appointment.findMany({
    where: {
      status: { in: ["NO_SHOW", "CANCELLED"] },
      followedUpAt: null,
    },
    orderBy: [{ date: "desc" }],
    take: 50,
    include: { patient: { select: { id: true, name: true } } },
  });

  // Filter out patients who already have a future active appointment
  const patientIds = candidates
    .map((c) => c.patientId)
    .filter((id): id is string => !!id);
  const rebooked = new Set(
    (
      await prisma.appointment.findMany({
        where: {
          patientId: { in: patientIds },
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { patientId: true },
      })
    ).map((a) => a.patientId)
  );
  const needsChasing = candidates.filter(
    (c) => !c.patientId || !rebooked.has(c.patientId)
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <PhoneCall className="size-6 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">
            No-shows and cancellations who haven&rsquo;t rebooked — worth a call.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {needsChasing.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nothing to chase — every missed or cancelled visit has been
              handled or rebooked. 🎉
            </CardContent>
          </Card>
        ) : (
          needsChasing.map((a) => (
            <Card key={a.id} className="py-0">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {a.patient ? (
                      <Link
                        href={`/admin/patients/${a.patient.id}`}
                        className="text-primary hover:underline"
                      >
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {a.reference}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.serviceTitle} · was {a.date} at {formatSlot(a.timeSlot)} ·{" "}
                    <a href={`tel:${a.phone.replace(/[^+\d]/g, "")}`} className="font-medium text-foreground hover:text-primary">
                      {a.phone}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      a.status === "NO_SHOW"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {a.status === "NO_SHOW" ? "No-show" : "Cancelled"}
                  </Badge>
                  <FollowUpActions id={a.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
