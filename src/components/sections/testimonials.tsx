import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { StarRating } from "@/components/reviews/star-rating";
import { getPublishedReviews, getReviewSummary } from "@/lib/reviews";
import { testimonials } from "@/data/testimonials";

/**
 * Real, moderated patient reviews when the clinic has them; the seeded
 * demo quotes only stand in while the review list is still short.
 */
export async function Testimonials() {
  const [reviews, summary] = await Promise.all([
    getPublishedReviews(3),
    getReviewSummary(),
  ]);

  const cards =
    reviews.length >= 3
      ? reviews.map((r) => ({
          key: r.id,
          name: r.authorName,
          treatment: r.serviceTitle ?? "Verified patient",
          quote: r.text,
          rating: r.rating,
        }))
      : testimonials.slice(0, 3).map((t) => ({
          key: t.name,
          name: t.name,
          treatment: t.treatment,
          quote: t.quote,
          rating: t.rating,
        }));

  return (
    <section className="bg-section py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient stories"
          title="Trusted by thousands of smiles"
          description={
            summary.count > 0
              ? `${summary.average} out of 5 from ${summary.count} verified patient review${summary.count === 1 ? "" : "s"}, collected after treatment.`
              : "Real feedback from real treatments — no scripts, no stock quotes."
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((t, i) => (
            <Reveal key={t.key} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <StarRating
                    value={t.rating}
                    label={`${t.rating} out of 5 stars from ${t.name}`}
                  />
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.treatment}</p>
                  </footer>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        {summary.count > 0 && (
          <p className="mt-8 text-center text-sm">
            <Link href="/reviews" className="font-semibold text-primary hover:underline">
              Read all {summary.count} patient reviews →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
