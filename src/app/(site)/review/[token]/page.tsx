import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/manage-token";
import { PageHero } from "@/components/page-hero";
import { ReviewForm } from "@/components/reviews/review-form";

export const metadata: Metadata = {
  title: "Rate your visit",
  robots: { index: false, follow: false },
};

export default async function ReviewPage(props: PageProps<"/review/[token]">) {
  const { token } = await props.params;
  const appointmentId = verifyToken("review", token);
  if (!appointmentId) notFound();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      name: true,
      serviceTitle: true,
      date: true,
      review: { select: { id: true } },
    },
  });
  if (!appointment) notFound();

  return (
    <>
      <PageHero
        eyebrow="Your feedback"
        title="How did we do?"
        description="It takes about 30 seconds, and it genuinely shapes how we run the practice."
      />
      <section className="py-14">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <ReviewForm
            token={token}
            defaultName={appointment.name}
            serviceTitle={appointment.serviceTitle}
            googleReviewUrl={process.env.GOOGLE_REVIEW_URL ?? null}
            alreadyReviewed={!!appointment.review}
          />
        </div>
      </section>
    </>
  );
}
