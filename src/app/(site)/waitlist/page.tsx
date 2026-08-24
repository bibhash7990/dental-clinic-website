import type { Metadata } from "next";
import { BellRing, CalendarClock, Zap } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { WaitlistForm } from "@/components/booking/waitlist-form";
import { getBookingOptions } from "@/lib/actions/booking";

export const metadata: Metadata = {
  title: "Cancellation Waitlist",
  description:
    "Join the BrightSmile Dental waitlist and we'll email you the moment an earlier appointment slot opens up.",
};

const steps = [
  {
    icon: BellRing,
    title: "Tell us what you need",
    body: "The treatment, your preferred dentist, and the window of dates that works for you.",
  },
  {
    icon: CalendarClock,
    title: "We watch the diary",
    body: "Every cancellation is checked against the list — including whether your treatment actually fits the gap.",
  },
  {
    icon: Zap,
    title: "You get first refusal",
    body: "An email goes out the moment a matching slot frees up. Slots are first come, first served.",
  },
];

export default async function WaitlistPage() {
  const { services, dentists, maxAdvanceDays } = await getBookingOptions();

  return (
    <>
      <PageHero
        eyebrow="Cancellation waitlist"
        title="Want to be seen sooner?"
        description="Patients cancel every week. Tell us what you're waiting for and we'll email you the moment a matching slot opens."
      />

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-background p-5"
              >
                <step.icon className="size-6 text-primary" aria-hidden />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {i + 1}
                </p>
                <h2 className="mt-1 font-heading font-bold">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <WaitlistForm
              services={services}
              dentists={dentists}
              maxAdvanceDays={maxAdvanceDays}
            />
          </div>
        </div>
      </section>
    </>
  );
}
