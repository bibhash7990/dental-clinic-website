import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareQuote, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewActions } from "@/components/admin/review-actions";
import { getReviewSummary } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

const FILTERS = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-cta/15 text-cta",
  REJECTED: "bg-destructive/10 text-destructive",
};

export default async function AdminReviewsPage(
  props: PageProps<"/admin/reviews">
) {
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;
  const filter = (FILTERS as readonly string[]).includes(raw ?? "")
    ? (raw as string)
    : "PENDING";

  const [reviews, pendingCount, summary] = await Promise.all([
    prisma.review.findMany({
      where: filter === "ALL" ? {} : { status: filter },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
      include: {
        appointment: { select: { reference: true, date: true } },
        patient: { select: { id: true, name: true } },
      },
    }),
    prisma.review.count({ where: { status: "PENDING" } }),
    getReviewSummary(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="size-6 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold">Reviews</h1>
            <p className="text-sm text-muted-foreground">
              Nothing appears on the website until you publish it.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">
            {summary.average || "—"}
            <Star
              className="ml-1 inline size-4 fill-amber-400 text-amber-400"
              aria-hidden
            />
          </p>
          <p className="text-xs text-muted-foreground">
            {summary.count} published · {pendingCount} waiting
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?status=${f}`}
            aria-current={filter === f ? "page" : undefined}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium capitalize",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f.toLowerCase()}
            {f === "PENDING" && pendingCount > 0 && (
              <span className="ml-1.5 tabular-nums">({pendingCount})</span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {filter === "PENDING"
                ? "No reviews waiting — you're all caught up."
                : "Nothing here yet."}
            </CardContent>
          </Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.patient ? (
                        <Link
                          href={`/admin/patients/${r.patient.id}`}
                          className="text-primary hover:underline"
                        >
                          {r.authorName}
                        </Link>
                      ) : (
                        r.authorName
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.serviceTitle ?? "—"}
                      {r.appointment
                        ? ` · ${r.appointment.date} · ${r.appointment.reference}`
                        : ""}
                      {" · "}
                      {r.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex items-center gap-0.5 font-semibold tabular-nums"
                      aria-label={`${r.rating} out of 5 stars`}
                    >
                      {r.rating}
                      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    </span>
                    {r.featured && <Badge variant="outline">Featured</Badge>}
                    <Badge className={STATUS_STYLES[r.status]}>
                      {r.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>

                <blockquote className="mt-3 text-sm leading-relaxed">
                  {r.text}
                </blockquote>

                {r.reply && (
                  <p className="mt-3 rounded-lg border-l-2 border-primary bg-section p-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Your reply: </span>
                    {r.reply}
                  </p>
                )}

                {r.rating <= 3 && r.status === "PENDING" && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Low rating — worth a phone call before deciding whether to
                    publish.
                  </p>
                )}

                <ReviewActions
                  id={r.id}
                  status={r.status}
                  featured={r.featured}
                  reply={r.reply}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
