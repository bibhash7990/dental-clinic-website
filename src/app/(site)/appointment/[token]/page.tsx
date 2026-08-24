import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { verifyManageToken } from "@/lib/manage-token";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { ManageAppointment } from "@/components/manage-appointment";
import { minBookingDate, maxBookingDate } from "@/lib/validation";
import { getBookingSettings } from "@/lib/availability";

export const metadata: Metadata = {
  title: "Manage Appointment",
  robots: { index: false, follow: false },
};

export default async function ManageAppointmentPage(
  props: PageProps<"/appointment/[token]">
) {
  const { token } = await props.params;
  const id = verifyManageToken(token);
  if (!id) notFound();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { dentist: { select: { name: true, title: true } } },
  });
  if (!appointment) notFound();

  const settings = await getBookingSettings();
  // Request-time comparison — this is a dynamic server component, so reading
  // the clock here is per-request, not per-re-render.
  // eslint-disable-next-line react-hooks/purity
  const isPast =
    new Date(`${appointment.date}T${appointment.timeSlot}:00`).getTime() <
    Date.now();

  if (appointment.status === "CANCELLED") {
    return (
      <>
        <PageHero eyebrow="Your appointment" title="Appointment cancelled" />
        <section className="py-16">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
            <CalendarX2 className="mx-auto size-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">
              This appointment ({appointment.reference}) has been cancelled.
              We&rsquo;d love to see you another time.
            </p>
            <Link href="/book" className={cn(buttonVariants(), "mt-6 h-11 bg-cta px-6 text-cta-foreground hover:bg-cta/90")}>
              Book a new appointment
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Your appointment"
        title={isPast ? "Past appointment" : "Manage your appointment"}
        description={
          isPast
            ? "This appointment has already taken place."
            : "Confirm, reschedule, cancel, or add it to your calendar."
        }
      />
      <section className="py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <ManageAppointment
            token={token}
            appointment={{
              reference: appointment.reference,
              name: appointment.name,
              serviceTitle: appointment.serviceTitle,
              date: appointment.date,
              timeSlot: appointment.timeSlot,
              durationMin: appointment.durationMin,
              status: appointment.status,
              dentistName: appointment.dentist?.name ?? null,
            }}
            isPast={isPast}
            minDate={minBookingDate()}
            maxDate={maxBookingDate(settings.maxAdvanceDays)}
          />
        </div>
      </section>
    </>
  );
}
