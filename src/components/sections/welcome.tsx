import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { site } from "@/data/site";

const points = [
  "Digital, low-radiation X-rays and 3D imaging",
  "Gentle care for anxious patients and children",
  "Transparent pricing and insurance handling",
  "Same-day crowns and emergency appointments",
];

export function Welcome() {
  return (
    <section className="bg-section py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
            <Image
              src="/images/welcome.jpg"
              alt="The bright, modern reception area of the clinic"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Welcome to {site.name}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dentistry that puts you at ease
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            We believe a dental visit should feel calm, clear, and personal.
            That&rsquo;s why every treatment plan starts with listening — and why our
            patients keep coming back, year after year.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-cta/15">
                  <Check className="size-3.5 text-cta" aria-hidden />
                </span>
                <span className="text-sm sm:text-base">{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-11 px-6")}
          >
            More about our clinic
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
