import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  services,
  categories,
  getServiceBySlug,
  getRelatedServices,
} from "@/data/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.title, description: service.description };
}

export default async function ServiceDetailPage(
  props: PageProps<"/services/[slug]">
) {
  const { slug } = await props.params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = getRelatedServices(service);
  const categoryName = categories.find((c) => c.id === service.category)?.name;

  return (
    <>
      <section className="bg-section">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Link
              href="/services"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All services
            </Link>
            <Badge variant="secondary" className="mb-3 block w-fit capitalize">
              {categoryName}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 text-primary" aria-hidden />
                {service.duration}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Tag className="size-4 text-primary" aria-hidden />
                From ${service.priceFrom}
              </span>
            </div>
            <Link
              href={`/book?service=${service.slug}`}
              className={cn(
                buttonVariants(),
                "mt-8 h-12 bg-cta px-7 text-base text-cta-foreground hover:bg-cta/90"
              )}
            >
              <CalendarCheck aria-hidden />
              Book this treatment
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
            <Image
              src={service.image}
              alt={service.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              About this treatment
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {service.longDescription}
            </p>
            <h3 className="mt-10 text-xl font-semibold">What&rsquo;s included</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-cta/15">
                    <Check className="size-3.5 text-cta" aria-hidden />
                  </span>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside>
            <h2 className="text-lg font-semibold">Related treatments</h2>
            <div className="mt-4 space-y-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Card className="py-0 transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={r.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium group-hover:text-primary">
                          {r.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {r.duration}
                        </p>
                      </div>
                      <ArrowRight
                        className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
