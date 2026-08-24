import type { ReactNode } from "react";
import { PageHero } from "@/components/page-hero";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} />
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-sm text-muted-foreground">Last updated {updated}</p>
          <div
            className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground
              [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline
              [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground
              [&_li]:pl-1 [&_strong]:text-foreground
              [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
          >
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
