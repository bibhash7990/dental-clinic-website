import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/manage-token";
import { PageHero } from "@/components/page-hero";
import { IntakeForm } from "@/components/intake/intake-form";
import { formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "New patient form",
  robots: { index: false, follow: false },
};

function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function IntakePage(props: PageProps<"/intake/[token]">) {
  const { token } = await props.params;
  const appointmentId = verifyToken("intake", token);
  if (!appointmentId) notFound();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      name: true,
      date: true,
      timeSlot: true,
      serviceTitle: true,
      status: true,
      intakeForm: { select: { status: true } },
    },
  });
  if (!appointment) notFound();

  const label = `your ${appointment.serviceTitle.toLowerCase()} on ${formatLongDate(
    appointment.date
  )} at ${formatSlot(appointment.timeSlot)}`;

  return (
    <>
      <PageHero
        eyebrow="Before your visit"
        title="New patient form"
        description={`Three minutes now saves the clipboard at reception — this is for ${label}.`}
      />
      <section className="py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <IntakeForm
            token={token}
            patientName={appointment.name}
            appointmentLabel={label}
            completed={appointment.intakeForm?.status === "COMPLETED"}
          />
        </div>
      </section>
    </>
  );
}
