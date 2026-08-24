import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServicesGrid } from "@/components/services-grid";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore 20 dental treatments across 9 specialties — cosmetic, restorative, preventive, surgical, orthodontic, pediatric, periodontal, endodontic, and technology.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Complete care for every smile"
        description="From routine check-ups to advanced implantology — filter by specialty to find the treatment you need."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServicesGrid />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
