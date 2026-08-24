import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { services, categories } from "@/data/services";

const featuredSlugs = [
  "comprehensive-checkups",
  "teeth-whitening",
  "dental-implants",
  "invisible-aligners",
  "root-canal-therapy",
  "childrens-dentistry",
];

export function ServicesPreview() {
  const featured = services.filter((s) => featuredSlugs.includes(s.slug));

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What we do"
          title="Complete care for every smile"
          description="Twenty treatments across nine specialties — preventive, cosmetic, restorative, and more."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 0.08}>
              <Link
                href={`/services/${service.slug}`}
                className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-2 capitalize">
                      {categories.find((c) => c.id === service.category)?.name}
                    </Badge>
                    <h3 className="text-lg font-semibold group-hover:text-primary">
                      {service.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Learn more
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6")}
          >
            View all 20 services
          </Link>
        </div>
      </div>
    </section>
  );
}
