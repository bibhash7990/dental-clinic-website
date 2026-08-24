import { prisma } from "@/lib/prisma";

export interface PublicReview {
  id: string;
  authorName: string;
  serviceTitle: string | null;
  rating: number;
  text: string;
  reply: string | null;
  createdAt: Date;
}

export interface ReviewSummary {
  count: number;
  average: number; // 0 when there are no reviews yet
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** Approved reviews for the public site, featured ones first. */
export async function getPublishedReviews(limit?: number): Promise<PublicReview[]> {
  return prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
    select: {
      id: true,
      authorName: true,
      serviceTitle: true,
      rating: true,
      text: true,
      reply: true,
      createdAt: true,
    },
  });
}

export async function getReviewSummary(): Promise<ReviewSummary> {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { status: "APPROVED" },
    _count: { rating: true },
  });
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  let count = 0;
  let total = 0;
  for (const row of rows) {
    const key = Math.min(5, Math.max(1, row.rating)) as 1 | 2 | 3 | 4 | 5;
    distribution[key] += row._count.rating;
    count += row._count.rating;
    total += row.rating * row._count.rating;
  }
  return {
    count,
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
    distribution,
  };
}
