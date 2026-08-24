import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";

export function CtaBand() {
  return (
    <section className="bg-primary">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          Ready for a healthier, brighter smile?
        </h2>
        <p className="max-w-xl text-primary-foreground/85">
          Book online in under a minute, or call us — new patients are always
          welcome.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
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
          <a
            href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 border-primary-foreground/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            )}
          >
            <Phone aria-hidden />
            {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
