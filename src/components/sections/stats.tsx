import { site } from "@/data/site";
import { Reveal } from "@/components/reveal";

export function Stats() {
  return (
    <section className="bg-primary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        {site.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.05} className="text-center">
            <p className="font-heading text-4xl font-bold text-primary-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
