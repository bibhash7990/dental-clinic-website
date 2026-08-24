import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { GalleryGrid } from "@/components/gallery-grid";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata: Metadata = {
  title: "Smile Gallery",
  description:
    "A look inside our clinic and the treatments we perform — from whitening and veneers to implants and aligners.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Smile Gallery"
        title="See the work we do"
        description="A glimpse of our clinic, technology, and the treatments behind ten thousand smiles."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GalleryGrid />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
