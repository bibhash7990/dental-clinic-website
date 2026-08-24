import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { FinancingCalculator } from "@/components/pricing/financing-calculator";
import { categories } from "@/data/services";
import { insuranceProviders } from "@/data/insurance";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Pricing & Payment Options",
  description:
    "Published starting prices for every treatment at BrightSmile Dental, plus insurance, membership and monthly payment options — no phone call required.",
};

const included = [
  "A written treatment plan with the full cost before anything starts",
  "Digital X-rays and photos as part of your exam — never billed separately",
  "Insurance claims filed by us, directly with your provider",
  "No charge if we need to see you again for the same problem within 30 days",
];

// Prices are editable in the admin panel — refresh the static page regularly
export const revalidate = 300;

export default async function PricingPage() {
  const services = await prisma.serviceItem.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }],
    select: {
      slug: true,
      title: true,
      category: true,
      price: true,
      durationMin: true,
    },
  });

  const grouped = new Map<string, typeof services>();
  for (const s of services) {
    const list = grouped.get(s.category) ?? [];
    list.push(s);
    grouped.set(s.category, list);
  }
  const orderedGroups = categories
    .filter((c) => c.id !== "all" && grouped.has(c.id))
    .map((c) => ({ id: c.id, name: c.name, items: grouped.get(c.id)! }));

  return (
    <>
      <PageHero
        eyebrow="Transparent pricing"
        title="What treatment costs here"
        description="Every treatment we offer, with its starting price. No “call for pricing”, no surprises at checkout."
      />

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="border-l-4 border-l-cta">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
              <ShieldCheck className="size-8 shrink-0 text-cta" aria-hidden />
              <div>
                <h2 className="font-heading text-lg font-bold">
                  What every price includes
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-cta" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="space-y-10">
            {orderedGroups.map((group) => (
              <div key={group.id}>
                <h2 className="font-heading text-xl font-bold">{group.name}</h2>
                <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-foreground/10">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      {group.name} treatments and starting prices
                    </caption>
                    <thead className="bg-section">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Treatment
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Typical visit
                        </th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">
                          From
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((s) => (
                        <tr key={s.slug} className="border-t border-border bg-background">
                          <th scope="row" className="px-4 py-3 font-medium">
                            <Link
                              href={`/services/${s.slug}`}
                              className="hover:text-primary hover:underline"
                            >
                              {s.title}
                            </Link>
                          </th>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.durationMin} min
                          </td>
                          <td className="px-4 py-3 text-right font-semibold tabular-nums">
                            {s.price > 0 ? `$${s.price.toLocaleString("en-US")}` : "Free"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Prices shown are the starting point for a standard case and are the
            figures used in this demo practice. Your written plan may differ once
            the dentist has examined you — you will always see the final number
            before treatment begins.
          </p>
        </div>
      </section>

      <section className="bg-section py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Spread the cost"
            title="Monthly payment calculator"
            description="See what a treatment plan looks like month to month before you commit."
          />
          <div className="mt-10">
            <FinancingCalculator />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <ShieldCheck className="size-7 text-primary" aria-hidden />
              <h2 className="mt-3 font-heading text-lg font-bold">
                Using your insurance
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We are in-network with the plans below and file claims for you.
                Bring your card to your first visit and we will confirm your
                benefit before treatment starts.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {insuranceProviders.map((p) => (
                  <li
                    key={p}
                    className="rounded-full bg-section px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Wallet className="size-7 text-cta" aria-hidden />
              <h2 className="mt-3 font-heading text-lg font-bold">
                No insurance? Membership plan
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For <strong className="text-foreground">$29 a month</strong> our
                in-house plan covers two check-ups, two cleanings and all routine
                X-rays each year, plus 15% off any other treatment. No deductibles,
                no annual maximum, no claim forms.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className={cn(
                    buttonVariants(),
                    "h-11 bg-cta px-5 text-cta-foreground hover:bg-cta/90"
                  )}
                >
                  Book an appointment
                </Link>
                <a
                  href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
                  className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
                >
                  Ask about the plan
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
