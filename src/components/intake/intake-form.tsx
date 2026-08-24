"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { intakeSchema, type IntakeInput } from "@/lib/validation";
import { submitIntake } from "@/lib/actions/intake";
import { MEDICAL_CONDITIONS } from "@/data/intake";
import { site } from "@/data/site";

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

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {step}
        </span>
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

interface IntakeFormProps {
  token: string;
  patientName: string;
  appointmentLabel: string;
  completed: boolean;
}

export function IntakeForm({
  token,
  patientName,
  appointmentLabel,
  completed,
}: IntakeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(completed);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IntakeInput>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      dateOfBirth: "",
      address: "",
      emergencyName: "",
      emergencyPhone: "",
      physician: "",
      conditions: [],
      otherConditions: "",
      medications: "",
      allergies: "",
      pregnant: "na",
      smoker: "no",
      lastVisit: "",
      dentalConcerns: "",
      anxiety: "none",
      insuranceProvider: "",
      insuranceMemberId: "",
      signature: "",
      consent: false as unknown as true,
    },
  });

  if (done) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-cta" aria-hidden />
          <h2 className="mt-4 font-heading text-xl font-bold">
            Your form is complete
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Thank you, {patientName.split(" ")[0]} — your clinical team will read
            it before {appointmentLabel}. Nothing else to do; just arrive five
            minutes early.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Need to change an answer? Call us on {site.phone}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = (data: IntakeInput) => {
    setServerError(null);
    startTransition(async () => {
      // Unchecked checkbox groups can arrive as `false` rather than an array
      const result = await submitIntake(token, {
        ...data,
        conditions: Array.isArray(data.conditions) ? data.conditions : [],
      });
      if (result.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(result.error);
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as keyof IntakeInput, { message });
        }
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <Section
            step={1}
            title="About you"
            description="So we can reach the right person in an emergency."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`mt-1.5 ${inputStyles}`}
                  aria-invalid={!!errors.dateOfBirth}
                  {...register("dateOfBirth")}
                />
                <FieldError message={errors.dateOfBirth?.message} />
              </div>
              <div>
                <Label htmlFor="address">Home address</Label>
                <Input
                  id="address"
                  className="mt-1.5 h-11"
                  autoComplete="street-address"
                  {...register("address")}
                />
              </div>
              <div>
                <Label htmlFor="emergencyName">Emergency contact</Label>
                <Input
                  id="emergencyName"
                  className="mt-1.5 h-11"
                  aria-invalid={!!errors.emergencyName}
                  {...register("emergencyName")}
                />
                <FieldError message={errors.emergencyName?.message} />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Their phone number</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  className="mt-1.5 h-11"
                  aria-invalid={!!errors.emergencyPhone}
                  {...register("emergencyPhone")}
                />
                <FieldError message={errors.emergencyPhone?.message} />
              </div>
            </div>
          </Section>

          <Section
            step={2}
            title="Medical history"
            description="Dental treatment interacts with the rest of your health — tick anything that applies."
          >
            <fieldset>
              <legend className="text-sm font-medium">
                Do you have, or have you had, any of these?
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {MEDICAL_CONDITIONS.map((condition) => (
                  <label
                    key={condition}
                    className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      value={condition}
                      className="size-4 accent-primary"
                      {...register("conditions")}
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <Label htmlFor="otherConditions">
                Anything else we should know about?
              </Label>
              <Input
                id="otherConditions"
                className="mt-1.5 h-11"
                {...register("otherConditions")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="medications">Current medications</Label>
                <Textarea
                  id="medications"
                  rows={3}
                  className="mt-1.5"
                  placeholder="Include dosage if you know it"
                  {...register("medications")}
                />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  rows={3}
                  className="mt-1.5"
                  placeholder="Latex, penicillin, local anaesthetic…"
                  {...register("allergies")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="physician">Your doctor / GP</Label>
                <Input id="physician" className="mt-1.5 h-11" {...register("physician")} />
              </div>
              <div>
                <Label htmlFor="pregnant">Pregnant or breastfeeding?</Label>
                <select
                  id="pregnant"
                  className={`mt-1.5 ${inputStyles}`}
                  {...register("pregnant")}
                >
                  <option value="na">Not applicable</option>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <Label htmlFor="smoker">Do you smoke or vape?</Label>
                <select
                  id="smoker"
                  className={`mt-1.5 ${inputStyles}`}
                  {...register("smoker")}
                >
                  <option value="no">No</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          </Section>

          <Section step={3} title="Your dental history">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="lastVisit">When did you last see a dentist?</Label>
                <Input
                  id="lastVisit"
                  className="mt-1.5 h-11"
                  placeholder="About 18 months ago"
                  {...register("lastVisit")}
                />
              </div>
              <div>
                <Label htmlFor="anxiety">How do you feel about dental visits?</Label>
                <select
                  id="anxiety"
                  className={`mt-1.5 ${inputStyles}`}
                  {...register("anxiety")}
                >
                  <option value="none">Comfortable</option>
                  <option value="some">A little nervous</option>
                  <option value="high">Very anxious</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="dentalConcerns">
                What would you most like us to look at?
              </Label>
              <Textarea
                id="dentalConcerns"
                rows={3}
                className="mt-1.5"
                placeholder="Sensitivity on the lower left, a chipped front tooth, whitening…"
                {...register("dentalConcerns")}
              />
            </div>
          </Section>

          <Section
            step={4}
            title="Insurance"
            description="Optional — it just saves time at reception."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="insuranceProvider">Provider</Label>
                <Input
                  id="insuranceProvider"
                  className="mt-1.5 h-11"
                  {...register("insuranceProvider")}
                />
              </div>
              <div>
                <Label htmlFor="insuranceMemberId">Member ID</Label>
                <Input
                  id="insuranceMemberId"
                  className="mt-1.5 h-11"
                  {...register("insuranceMemberId")}
                />
              </div>
            </div>
          </Section>

          <Section step={5} title="Confirm and sign">
            <div>
              <Label htmlFor="signature">Type your full name to sign</Label>
              <Input
                id="signature"
                className="mt-1.5 h-11"
                placeholder={patientName}
                aria-invalid={!!errors.signature}
                {...register("signature")}
              />
              <FieldError message={errors.signature?.message} />
            </div>
            <div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  {...register("consent")}
                />
                <span className="text-muted-foreground">
                  The information above is accurate to the best of my knowledge,
                  and I consent to {site.name} using it to plan my care.
                </span>
              </label>
              <FieldError message={errors.consent?.message} />
            </div>

            <p className="flex items-start gap-2 rounded-lg bg-section p-4 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              Your answers are stored on the practice&rsquo;s own system and seen
              only by the clinical team treating you.
            </p>
          </Section>

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
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Submit my form
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
