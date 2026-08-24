import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { testimonials } from "@/data/testimonials";

function Rating({ value, name }: { value: number; name: string }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars from ${name}`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={
            i < value
              ? "size-4 fill-amber-400 text-amber-400"
              : "size-4 text-border"
          }
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-section py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient stories"
          title="Trusted by thousands of smiles"
          description="Real feedback from real treatments — no scripts, no stock quotes."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <Rating value={t.rating} name={t.name} />
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <footer>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.treatment}</p>
                  </footer>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
