import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, Microscope, ShieldCheck, Users } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { CtaBand } from "@/components/sections/cta-band";
import { Stats } from "@/components/sections/stats";
import { team } from "@/data/team";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Meet the team behind ${site.name} — modern, gentle dentistry built on listening, technology, and trust.`,
};

const values = [
  {
    icon: HeartHandshake,
    title: "Patients first",
    text: "Treatment plans built around your goals and budget — never the other way round.",
  },
  {
    icon: Microscope,
    title: "Modern technology",
    text: "3D imaging, same-day crowns, and laser therapy for faster, gentler care.",
  },
  {
    icon: ShieldCheck,
    title: "Honest advice",
    text: "Clear pricing, no upselling, and a second opinion whenever you want one.",
  },
  {
    icon: Users,
    title: "Family friendly",
    text: "From first baby teeth to implants — one clinic for every generation.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={`The people behind ${site.name}`}
        description="A team that treats you like family, in a clinic designed to put you at ease."
      />

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our story
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {site.name} was founded in 2010 with a simple idea: dental care
              works best when patients actually enjoy coming in. What started as
              a two-chair practice has grown into a full-service clinic with
              four specialists — but the first appointment still starts the
              same way: with a conversation, not a drill.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Today we care for more than ten thousand patients, from toddlers
              at their first check-up to grandparents getting implant-supported
              smiles. We invest continuously in technology — not for its own
              sake, but because better tools mean shorter visits, gentler
              treatment, and results that last.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/images/welcome.jpg"
                alt="The clinic's modern, light-filled treatment room"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-section py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our values"
            title="What we stand for"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={(i % 4) * 0.06}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <value.icon className="size-6 text-primary" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-semibold">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {value.text}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Meet the team"
            title="Specialists who love what they do"
            description="Four experts, one shared standard of care."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={(i % 4) * 0.06}>
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <span
                      aria-hidden
                      className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 font-heading text-2xl font-bold text-primary"
                    >
                      {member.initials}
                    </span>
                    <h3 className="mt-4 font-semibold">{member.name}</h3>
                    <p className="text-sm font-medium text-primary">
                      {member.role}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      {member.credentials}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Stats />
      <CtaBand />
    </>
  );
}
