import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${site.name} — call, email, or send us a message and we'll reply within one business day.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        description="Questions about treatment, insurance, or appointments — send us a message or drop by."
      />
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <aside className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="font-semibold">Contact information</h2>
                <p className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {site.address.line1}, {site.address.line2},{" "}
                  {site.address.city} {site.address.zip}
                </p>
                <p className="flex items-start gap-3 text-sm">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <a
                    href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {site.phone}
                  </a>
                </p>
                <p className="flex items-start gap-3 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <a
                    href={`mailto:${site.email}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {site.email}
                  </a>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Clock className="size-4 text-primary" aria-hidden />
                  Opening hours
                </h2>
                <ul className="mt-4 space-y-2">
                  {site.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between gap-4 text-sm text-muted-foreground"
                    >
                      <span>{h.day}</span>
                      <span
                        className={h.hours === "Closed" ? "text-destructive" : ""}
                      >
                        {h.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="overflow-hidden py-0">
              <div className="flex aspect-[4/3] items-center justify-center bg-section">
                <div className="text-center">
                  <MapPin className="mx-auto size-8 text-primary" aria-hidden />
                  <p className="mt-2 px-6 text-sm text-muted-foreground">
                    Map placeholder — embed Google Maps here for the production
                    site.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
