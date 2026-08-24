import type { Metadata } from "next";
import { Clock, Gift, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { BookingForm } from "@/components/booking/booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { getBookingOptions } from "@/lib/actions/booking";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your dental appointment online in under a minute — choose a treatment, pick a time, and we'll confirm shortly.",
};

const infoCards = [
  {
    icon: Clock,
    title: "What to expect",
    text: "Arrive 10 minutes early for your first visit. Bring a photo ID and your insurance card — we handle the rest of the paperwork.",
  },
  {
    icon: Gift,
    title: "New patient offer",
    text: "First visit includes a full exam, digital X-rays, and a consultation — a $350 value — bundled at a special rate.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance & payment",
    text: "We accept all major insurance plans and verify your benefits before treatment. Flexible payment plans available.",
  },
];

export default async function BookPage(props: PageProps<"/book">) {
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.service)
    ? searchParams.service[0]
    : searchParams.service;
  const options = await getBookingOptions();
  const defaultService = options.services.some((s) => s.slug === raw)
    ? raw
    : undefined;

  return (
    <>
      <PageHero
        eyebrow="Online booking"
        title="Book your appointment"
        description="Choose a treatment and a time that suits you — we'll confirm by email shortly after."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <BookingForm
              services={options.services}
              dentists={options.dentists}
              maxAdvanceDays={options.maxAdvanceDays}
              defaultService={defaultService}
            />
          </div>
          <aside className="space-y-4">
            {infoCards.map((card) => (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10">
                    <card.icon className="size-5 text-primary" aria-hidden />
                  </span>
                  <h2 className="mt-3 font-semibold">{card.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {card.text}
                  </p>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold">Prefer to call?</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Our front desk is happy to help you find the right time.
                </p>
                <a
                  href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                  className="mt-2 inline-block font-heading text-lg font-bold text-primary"
                >
                  {site.phone}
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
