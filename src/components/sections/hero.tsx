import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-section">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            Welcoming new patients
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your smile,{" "}
            <span className="text-primary">in caring hands</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {site.name} combines modern technology with a gentle, personal
            approach — from routine check-ups to complete smile makeovers, all
            under one roof.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className={cn(
                buttonVariants(),
                "h-12 bg-cta px-7 text-base text-cta-foreground hover:bg-cta/90"
              )}
            >
              <CalendarCheck aria-hidden />
              Book Appointment
            </Link>
            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 px-7 text-base"
              )}
            >
              Explore Services
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-cta" aria-hidden />
              All major insurance accepted
            </li>
            <li className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-cta" aria-hidden />
              Same-day emergency slots
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/images/hero-bg.jpg"
              alt="A dentist treating a smiling patient in a modern clinic"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 rounded-2xl border border-border bg-background px-5 py-3 shadow-lg">
            <p className="font-heading text-2xl font-bold text-primary">15+</p>
            <p className="text-sm text-muted-foreground">Years of experience</p>
          </div>
        </div>
      </div>
    </section>
  );
}
