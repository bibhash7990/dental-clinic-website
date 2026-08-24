"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services, categories, type ServiceCategory } from "@/data/services";

export function ServicesGrid() {
  const [active, setActive] = useState<ServiceCategory | "all">("all");

  const filtered =
    active === "all" ? services : services.filter((s) => s.category === active);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter services by category"
        className="flex flex-wrap justify-center gap-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            aria-pressed={active === cat.id}
            className={cn(
              "min-h-10 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} {filtered.length === 1 ? "service" : "services"}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
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
                <Badge className="absolute left-3 top-3 capitalize" variant="secondary">
                  {categories.find((c) => c.id === service.category)?.name}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {service.features.slice(0, 3).map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-3.5 shrink-0 text-cta" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  View details
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
