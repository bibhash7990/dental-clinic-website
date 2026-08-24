"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingSchema, type BookingInput, minBookingDate, maxBookingDate } from "@/lib/validation";
import {
  createBooking,
  getPublicAvailability,
  type PublicDentist,
  type PublicService,
} from "@/lib/actions/booking";
import { formatSlot } from "@/data/site";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

const inputStyles =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring";

interface BookingFormProps {
  services: PublicService[];
  dentists: PublicDentist[];
  maxAdvanceDays: number;
  defaultService?: string;
}

export function BookingForm({
  services,
  dentists,
  maxAdvanceDays,
  defaultService,
}: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceSlug: defaultService ?? "",
      dentistId: "any",
      date: "",
      timeSlot: "",
      isNewPatient: false,
      notes: "",
    },
  });

  const selectedDate = watch("date");
  const selectedService = watch("serviceSlug");
  const selectedDentist = watch("dentistId");
  const selectedSlot = watch("timeSlot");

  useEffect(() => {
    if (
      !selectedDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
      !selectedService
    ) {
      setSlots([]);
      setClosedReason(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setValue("timeSlot", "");
    getPublicAvailability(selectedDate, selectedService, selectedDentist)
      .then((result) => {
        if (cancelled) return;
        setSlots(result.slots.map((s) => s.time));
        setClosedReason(result.closed ? (result.closedReason ?? "Closed") : null);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedService, selectedDentist, setValue]);

  const onSubmit = (data: BookingInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await createBooking(data);
      if (result.ok) {
        setConfirmedRef(result.reference);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(result.error);
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            setError(field as keyof BookingInput, { message });
          }
          if (result.fieldErrors.timeSlot && selectedDate && selectedService) {
            const refreshed = await getPublicAvailability(
              selectedDate,
              selectedService,
              selectedDentist
            );
            setSlots(refreshed.slots.map((s) => s.time));
          }
        }
      }
    });
  };

  if (confirmedRef) {
    return (
      <div className="rounded-2xl border border-cta/30 bg-cta/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-cta" aria-hidden />
        <h2 className="mt-4 text-2xl font-bold">Appointment requested!</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          We&rsquo;ve received your booking and sent a confirmation to your
          email. Our team will confirm your appointment shortly.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">Your booking reference</p>
        <p className="font-heading text-3xl font-bold tracking-wider text-primary">
          {confirmedRef}
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8 h-11 px-6")}
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Doe"
            className="mt-2 h-11"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            className="mt-2 h-11"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          className="mt-2 h-11"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="serviceSlug">Treatment</Label>
          <select
            id="serviceSlug"
            className={cn(inputStyles, "mt-2 cursor-pointer")}
            aria-invalid={!!errors.serviceSlug}
            {...register("serviceSlug")}
          >
            <option value="" disabled>
              Choose a treatment…
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title} · {s.durationMin} min
              </option>
            ))}
          </select>
          <FieldError message={errors.serviceSlug?.message} />
        </div>
        <div>
          <Label htmlFor="dentistId">Dentist</Label>
          <select
            id="dentistId"
            className={cn(inputStyles, "mt-2 cursor-pointer")}
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

      <div>
        <Label htmlFor="date">Preferred date</Label>
        <Input
          id="date"
          type="date"
          min={minBookingDate()}
          max={maxBookingDate(maxAdvanceDays)}
          className="mt-2 h-11"
          aria-invalid={!!errors.date}
          {...register("date")}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Bookings open from tomorrow up to {maxAdvanceDays} days ahead.
        </p>
        <FieldError message={errors.date?.message} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Available times</legend>
        {!selectedService ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a treatment first.
          </p>
        ) : !selectedDate ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a date to see available time slots.
          </p>
        ) : slotsLoading ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Checking availability…
          </p>
        ) : closedReason ? (
          <p className="mt-2 text-sm font-medium text-destructive">
            We&rsquo;re closed on this date ({closedReason}). Please pick another day.
          </p>
        ) : slots.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No free slots on this date — please try another day or dentist.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((slot) => {
              const selected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setValue("timeSlot", slot, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={cn(
                    "h-11 cursor-pointer rounded-lg border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary hover:text-primary"
                  )}
                >
                  {formatSlot(slot)}
                </button>
              );
            })}
          </div>
        )}
        <FieldError message={errors.timeSlot?.message} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Have you visited us before?</legend>
        <div className="mt-2 flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              value="false"
              checked={!watch("isNewPatient")}
              onChange={() => setValue("isNewPatient", false)}
              className="size-4 accent-[var(--primary)]"
            />
            Returning patient
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              value="true"
              checked={watch("isNewPatient")}
              onChange={() => setValue("isNewPatient", true)}
              className="size-4 accent-[var(--primary)]"
            />
            New patient
          </label>
        </div>
      </fieldset>

      <div>
        <Label htmlFor="notes">Notes for our team (optional)</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Anything we should know — symptoms, anxiety, insurance questions…"
          className="mt-2"
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full bg-cta text-base text-cta-foreground hover:bg-cta/90"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Booking…
          </>
        ) : (
          <>
            <CalendarCheck aria-hidden />
            Request Appointment
          </>
        )}
      </Button>
    </form>
  );
}
