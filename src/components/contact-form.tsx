"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoneypotField } from "@/components/honeypot-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { submitContact } from "@/lib/actions/contact";

const subjects = [
  "General question",
  "Appointment request",
  "Insurance & billing",
  "Treatment question",
  "Feedback",
];

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

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await submitContact(data);
      if (result.ok) {
        setSent(true);
      } else {
        setServerError(result.error);
      }
    });
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-cta/30 bg-cta/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-cta" aria-hidden />
        <h2 className="mt-4 text-xl font-bold">Message sent!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out — we typically reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
      <HoneypotField register={register("website")} />
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {serverError}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Jane Doe"
            className="mt-2 h-11"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            className="mt-2 h-11"
            {...register("phone")}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="jane@example.com"
          className="mt-2 h-11"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="contact-subject">Subject</Label>
        <select
          id="contact-subject"
          className={cn(inputStyles, "mt-2 cursor-pointer")}
          aria-invalid={!!errors.subject}
          {...register("subject")}
        >
          <option value="" disabled>
            Choose a subject…
          </option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <FieldError message={errors.subject?.message} />
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="How can we help?"
          className="mt-2"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>
      <Button type="submit" disabled={isPending} className="h-11 px-6">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send aria-hidden />
            Send message
          </>
        )}
      </Button>
    </form>
  );
}
