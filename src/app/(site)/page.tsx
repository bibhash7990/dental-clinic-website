import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { Welcome } from "@/components/sections/welcome";
import { ServicesPreview } from "@/components/sections/services-preview";
import { InsuranceWall } from "@/components/sections/insurance-wall";
import { Testimonials } from "@/components/sections/testimonials";
import { FaqSection } from "@/components/sections/faq";
import { CtaBand } from "@/components/sections/cta-band";
import { getReviewSummary } from "@/lib/reviews";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

function LocalBusinessJsonLd({
  rating,
}: {
  rating: { count: number; average: number };
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: site.name,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.zip,
    },
    openingHours: ["Mo-Th 08:00-18:00", "Fr 08:00-16:00", "Sa 09:00-13:00"],
    ...(rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function HomePage() {
  const rating = await getReviewSummary();
  return (
    <>
      <LocalBusinessJsonLd rating={rating} />
      <Hero />
      <Stats />
      <Welcome />
      <ServicesPreview />
      <InsuranceWall />
      <Testimonials />
      <FaqSection />
      <CtaBand />
    </>
  );
}
