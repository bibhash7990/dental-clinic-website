import { ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { insuranceProviders } from "@/data/insurance";

export function InsuranceWall() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Insurance"
          title="We work with your insurance"
          description="Benefits verified before treatment, claims handled for you."
        />
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {insuranceProviders.map((provider) => (
            <li
              key={provider}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-5 text-sm font-semibold text-muted-foreground"
            >
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
              {provider}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
