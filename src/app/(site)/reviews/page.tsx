import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/page-hero";
import { StarRating } from "@/components/reviews/star-rating";
import { getPublishedReviews, getReviewSummary } from "@/lib/reviews";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Patient Reviews",
  description:
    "Verified reviews from BrightSmile Dental patients, collected after treatment and published unedited.",
};

export const revalidate = 300;

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function ReviewsPage() {
  const [reviews, summary] = await Promise.all([
    getPublishedReviews(),
    getReviewSummary(),
  ]);

  const jsonLd =
    summary.count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Dentist",
          name: site.name,
          telephone: site.phone,
          address: {
            "@type": "PostalAddress",
            streetAddress: `${site.address.line1}, ${site.address.line2}`,
            addressLocality: site.address.city,
            postalCode: site.address.zip,
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average,
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 20).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.authorName },
            datePublished: r.createdAt.toISOString().slice(0, 10),
            reviewBody: r.text,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PageHero
        eyebrow="Patient reviews"
        title="What our patients say"
        description="Every review here comes from a patient we actually treated — invited by email after their visit and published exactly as written."
      />

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {summary.count === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <MessageSquareQuote
                  className="mx-auto size-10 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-4 text-muted-foreground">
                  No published reviews yet — we invite every patient to rate their
                  visit, and the first ones will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-section">
                <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center sm:gap-10">
                  <div className="text-center">
                    <p className="font-heading text-5xl font-bold tabular-nums text-primary">
                      {summary.average.toFixed(1)}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <StarRating
                        value={summary.average}
                        label={`Average rating ${summary.average} out of 5`}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {summary.count} review{summary.count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="w-full flex-1 space-y-1.5">
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                      const count = summary.distribution[star];
                      const pct = summary.count
                        ? Math.round((count / summary.count) * 100)
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-xs">
                          <span className="w-8 shrink-0 text-muted-foreground">
                            {star} ★
                          </span>
                          <div
                            className="h-2 flex-1 overflow-hidden rounded-full bg-border"
                            role="img"
                            aria-label={`${count} ${star}-star review${count === 1 ? "" : "s"}`}
                          >
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 space-y-4">
                {reviews.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{r.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.serviceTitle ?? "Verified patient"} ·{" "}
                            {formatMonth(r.createdAt)}
                          </p>
                        </div>
                        <StarRating
                          value={r.rating}
                          label={`${r.rating} out of 5 stars from ${r.authorName}`}
                        />
                      </div>
                      <blockquote className="mt-3 text-sm leading-relaxed">
                        {r.text}
                      </blockquote>
                      {r.reply && (
                        <div className="mt-4 rounded-lg border-l-2 border-primary bg-section p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Response from {site.name}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {r.reply}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Been treated here recently? Check your email — we send a one-tap
              rating link after every visit.
            </p>
            <Link
              href="/book"
              className={cn(
                buttonVariants(),
                "mt-4 h-11 bg-cta px-6 text-cta-foreground hover:bg-cta/90"
              )}
            >
              Book your appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
