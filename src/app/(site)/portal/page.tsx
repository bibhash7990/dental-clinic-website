import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  ClipboardList,
  FileText,
  LogOut,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/page-hero";
import { PortalLogin } from "@/components/portal/portal-login";
import { getPortalEmail } from "@/lib/portal";
import { portalLogout } from "@/lib/actions/portal";
import { createToken, createManageToken } from "@/lib/manage-token";
import { formatSlot } from "@/data/site";

export const metadata: Metadata = {
  title: "Patient Portal",
  description:
    "Sign in with your email to see your BrightSmile Dental appointments, history, and forms.",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-primary/15 text-primary",
  ARRIVED: "bg-violet-100 text-violet-900",
  COMPLETED: "bg-cta/15 text-cta",
  CANCELLED: "bg-destructive/10 text-destructive",
  NO_SHOW: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  ARRIVED: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "Missed",
};

function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PortalPage(props: PageProps<"/portal">) {
  const email = await getPortalEmail();

  if (!email) {
    const { expired } = await props.searchParams;
    return (
      <>
        <PageHero
          eyebrow="Patient portal"
          title="Your appointments, in one place"
          description="See everything you have booked, your visit history, and any forms still to complete — no password needed."
        />
        <section className="py-14">
          <div className="mx-auto max-w-md px-4 sm:px-6">
            {expired && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-900"
              >
                That sign-in link has already been used or expired. Enter your
                email and we&rsquo;ll send a fresh one.
              </p>
            )}
            <PortalLogin />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/book" className="font-semibold text-primary hover:underline">
                Book your first appointment
              </Link>
            </p>
          </div>
        </section>
      </>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const appointments = await prisma.appointment.findMany({
    where: { email },
    orderBy: [{ date: "desc" }, { timeSlot: "desc" }],
    include: {
      dentist: { select: { name: true, title: true } },
      intakeForm: { select: { status: true } },
      review: { select: { id: true } },
    },
  });

  const upcoming = appointments
    .filter((a) => a.date >= today && !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.status))
    .reverse();
  const past = appointments.filter((a) => !upcoming.includes(a));
  const firstName = appointments[0]?.name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHero eyebrow="Patient portal" title={`Hello, ${firstName}`} />
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{email}</span>
            </p>
            <form action={portalLogout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </form>
          </div>

          <h2 className="mt-8 flex items-center gap-2 font-heading text-xl font-bold">
            <CalendarClock className="size-5 text-primary" aria-hidden />
            Upcoming
          </h2>
          <div className="mt-4 space-y-4">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    You have nothing booked at the moment.
                  </p>
                  <Link
                    href="/book"
                    className={cn(
                      buttonVariants(),
                      "mt-4 h-11 bg-cta px-5 text-cta-foreground hover:bg-cta/90"
                    )}
                  >
                    Book an appointment
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcoming.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-lg font-bold">
                          {a.serviceTitle}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatLongDate(a.date)} at {formatSlot(a.timeSlot)}
                          {a.dentist ? ` · ${a.dentist.name}` : ""}
                        </p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {a.reference}
                        </p>
                      </div>
                      <Badge className={STATUS_STYLES[a.status]}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/appointment/${createManageToken(a.id)}`}
                        className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}
                      >
                        <CalendarClock className="size-4" aria-hidden />
                        Manage
                      </Link>
                      {a.intakeForm?.status === "SENT" && (
                        <Link
                          href={`/intake/${createToken("intake", a.id)}`}
                          className={cn(
                            buttonVariants(),
                            "h-10 bg-cta px-4 text-cta-foreground hover:bg-cta/90"
                          )}
                        >
                          <ClipboardList className="size-4" aria-hidden />
                          Complete my form
                        </Link>
                      )}
                      {a.intakeForm?.status === "COMPLETED" && (
                        <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-section px-4 text-sm text-muted-foreground">
                          <FileText className="size-4" aria-hidden />
                          Forms complete
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {past.length > 0 && (
            <>
              <h2 className="mt-10 font-heading text-xl font-bold">Visit history</h2>
              <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-foreground/10">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Your previous appointments</caption>
                  <thead className="bg-section">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Treatment</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {past.map((a) => (
                      <tr key={a.id} className="border-t border-border bg-background">
                        <td className="whitespace-nowrap px-4 py-3">
                          {a.date} · {formatSlot(a.timeSlot)}
                        </td>
                        <td className="px-4 py-3">{a.serviceTitle}</td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_STYLES[a.status]}>
                            {STATUS_LABELS[a.status] ?? a.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {a.status === "COMPLETED" && !a.review && (
                            <Link
                              href={`/review/${createToken("review", a.id)}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              <Star className="size-3.5" aria-hidden />
                              Rate this visit
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/book"
              className={cn(
                buttonVariants(),
                "h-11 bg-cta px-6 text-cta-foreground hover:bg-cta/90"
              )}
            >
              Book another appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
