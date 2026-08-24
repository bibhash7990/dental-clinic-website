import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecallActions } from "@/components/admin/recall-actions";
import { getRecallDue, getRecallMonths } from "@/lib/recall";

export const metadata: Metadata = {
  title: "Recall list",
  robots: { index: false, follow: false },
};

export default async function RecallPage() {
  const months = await getRecallMonths();
  const due = await getRecallDue(months);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <CalendarHeart className="size-6 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold">Recall list</h1>
          <p className="text-sm text-muted-foreground">
            Patients whose last visit was over {months} months ago with nothing
            booked. Contacted patients drop off the list for 60 days.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {due.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nobody is overdue right now — every patient has either been seen
              recently, has something booked, or has already been contacted.
            </CardContent>
          </Card>
        ) : (
          due.map((p) => (
            <Card key={p.patientId} className="py-0">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    <Link
                      href={`/admin/patients/${p.patientId}`}
                      className="text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                    <Badge className="ml-2 bg-amber-100 text-amber-800">
                      {p.monthsSince} months
                    </Badge>
                    {p.recallSentAt && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        last contacted {p.recallSentAt.toISOString().slice(0, 10)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last visit {p.lastVisit} · {p.lastTreatment} ·{" "}
                    <a
                      href={`tel:${p.phone.replace(/[^+\d]/g, "")}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {p.phone}
                    </a>
                    {p.email ? ` · ${p.email}` : " · no email on file"}
                  </p>
                </div>
                <RecallActions
                  patientId={p.patientId}
                  hasEmail={!!p.email}
                  alreadySent={!!p.recallSentAt}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
