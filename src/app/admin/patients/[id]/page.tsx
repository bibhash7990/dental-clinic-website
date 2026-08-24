import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientEditor, PatientNotes } from "@/components/admin/patient-detail";
import { formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "Patient",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-primary/15 text-primary",
  ARRIVED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-cta/15 text-cta",
  CANCELLED: "bg-destructive/10 text-destructive",
  NO_SHOW: "bg-destructive/10 text-destructive",
};

export default async function PatientDetailPage(
  props: PageProps<"/admin/patients/[id]">
) {
  const { id } = await props.params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: [{ date: "desc" }, { timeSlot: "desc" }],
        include: { dentist: { select: { name: true } } },
      },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!patient) notFound();

  const noShows = patient.appointments.filter((a) => a.status === "NO_SHOW").length;
  const completed = patient.appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/patients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All patients
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{patient.name}</h1>
        <Badge variant="secondary">
          {patient.appointments.length} visit
          {patient.appointments.length === 1 ? "" : "s"}
        </Badge>
        {completed > 0 && (
          <Badge className="bg-cta/15 text-cta">{completed} completed</Badge>
        )}
        {noShows > 0 && (
          <Badge className="bg-destructive/10 text-destructive">
            {noShows} no-show{noShows === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <PatientEditor
            patient={{
              id: patient.id,
              name: patient.name,
              phone: patient.phone,
              email: patient.email ?? "",
              dateOfBirth: patient.dateOfBirth ?? "",
            }}
          />
          <PatientNotes
            patientId={patient.id}
            notes={patient.notes.map((n) => ({
              id: n.id,
              authorName: n.authorName,
              text: n.text,
              createdAt: n.createdAt.toLocaleString("en-US"),
            }))}
          />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Appointment history</h2>
          <div className="mt-3 space-y-3">
            {patient.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments yet.</p>
            ) : (
              patient.appointments.map((a) => (
                <Card key={a.id} className="py-0">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">
                        {a.serviceTitle}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {a.reference}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {a.date} at {formatSlot(a.timeSlot)}
                        {a.dentist ? ` · ${a.dentist.name}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        statusStyles[a.status] ?? "bg-muted"
                      )}
                    >
                      {a.status.toLowerCase().replace("_", "-")}
                    </span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
