"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoneypotField } from "@/components/honeypot-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { waitlistSchema, type WaitlistInput, minBookingDate, maxBookingDate } from "@/lib/validation";
import { joinWaitlist } from "@/lib/actions/waitlist";
import type { PublicDentist, PublicService } from "@/lib/actions/booking";

const inputStyles =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

interface WaitlistFormProps {
  services: PublicService[];
  dentists: PublicDentist[];
  maxAdvanceDays: number;
}

export function WaitlistForm({
  services,
  dentists,
  maxAdvanceDays,
}: WaitlistFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const minDate = minBookingDate();
  const maxDate = maxBookingDate(maxAdvanceDays);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceSlug: "",
      dentistId: "any",
      earliestDate: minDate,
      latestDate: maxDate,
      preference: "ANY",
      notes: "",
    },
  });

  if (joined) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-cta" aria-hidden />
          <h2 className="mt-4 font-heading text-xl font-bold">
            You&rsquo;re on the list
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The moment a matching slot frees up we&rsquo;ll email you — usually
            within a few days, since cancellations are common. Slots are first
            come, first served, so book as soon as you see the email.
          </p>
          <Link
            href="/book"
            className={cn(
              buttonVariants(),
              "mt-6 h-11 bg-cta px-5 text-cta-foreground hover:bg-cta/90"
            )}
          >
            Book a regular appointment too
          </Link>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = (data: WaitlistInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await joinWaitlist(data);
      if (result.ok) {
        setJoined(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(result.error);
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as keyof WaitlistInput, { message });
        }
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5" noValidate>
          <HoneypotField register={register("website")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="wl-name">Full name</Label>
              <Input
                id="wl-name"
                className="mt-1.5 h-11"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="wl-phone">Phone</Label>
              <Input
                id="wl-phone"
                type="tel"
                className="mt-1.5 h-11"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="wl-email">Email</Label>
            <Input
              id="wl-email"
              type="email"
              className="mt-1.5 h-11"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="wl-service">Treatment</Label>
              <select
                id="wl-service"
                className={`mt-1.5 ${inputStyles}`}
                aria-invalid={!!errors.serviceSlug}
                {...register("serviceSlug")}
              >
                <option value="">Choose a treatment…</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title} ({s.durationMin} min)
                  </option>
                ))}
              </select>
              <FieldError message={errors.serviceSlug?.message} />
            </div>
            <div>
              <Label htmlFor="wl-dentist">Dentist</Label>
              <select
                id="wl-dentist"
                className={`mt-1.5 ${inputStyles}`}
                {...register("dentistId")}
              >
                <option value="any">Any available dentist</option>
                {dentists.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.title ? ` — ${d.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium">
              When would you take a slot?
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="wl-earliest">From</Label>
                <input
                  id="wl-earliest"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  className={`mt-1.5 ${inputStyles}`}
                  aria-invalid={!!errors.earliestDate}
                  {...register("earliestDate")}
                />
                <FieldError message={errors.earliestDate?.message} />
              </div>
              <div>
                <Label htmlFor="wl-latest">Until</Label>
                <input
                  id="wl-latest"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  className={`mt-1.5 ${inputStyles}`}
                  aria-invalid={!!errors.latestDate}
                  {...register("latestDate")}
                />
                <FieldError message={errors.latestDate?.message} />
              </div>
              <div>
                <Label htmlFor="wl-preference">Time of day</Label>
                <select
                  id="wl-preference"
                  className={`mt-1.5 ${inputStyles}`}
                  {...register("preference")}
                >
                  <option value="ANY">Any time</option>
                  <option value="MORNING">Mornings only</option>
                  <option value="AFTERNOON">Afternoons only</option>
                </select>
              </div>
            </div>
          </fieldset>

          <div>
            <Label htmlFor="wl-notes">Anything we should know? (optional)</Label>
            <Textarea
              id="wl-notes"
              rows={3}
              className="mt-1.5"
              placeholder="I can usually get here at short notice, in pain on the lower right…"
              {...register("notes")}
            />
          </div>

          {serverError && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full bg-cta text-base text-cta-foreground hover:bg-cta/90"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <BellRing className="size-4" aria-hidden />
            )}
            Notify me when a slot opens
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
