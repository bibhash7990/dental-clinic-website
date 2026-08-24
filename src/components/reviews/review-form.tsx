"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/actions/reviews";
import { site } from "@/data/site";

const RATING_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

interface ReviewFormProps {
  token: string;
  defaultName: string;
  serviceTitle: string;
  googleReviewUrl: string | null;
  alreadyReviewed: boolean;
}

export function ReviewForm({
  token,
  defaultName,
  serviceTitle,
  googleReviewUrl,
  alreadyReviewed,
}: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState(defaultName);
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(alreadyReviewed ? -1 : null);

  if (done !== null) {
    const happy = done < 0 || done >= 4;
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-cta" aria-hidden />
          <h2 className="mt-4 font-heading text-xl font-bold">
            {done < 0 ? "You've already rated this visit" : "Thank you — that's really helpful"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {happy
              ? "Your feedback goes straight to the team who treated you. Once a staff member has checked it, it may appear on our reviews page."
              : "Sorry it wasn't the visit you hoped for. Our practice manager reads every rating and will be in touch — you can also call us directly."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {googleReviewUrl && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants(), "h-11 px-5")}
              >
                Also review us on Google
              </a>
            )}
            <a
              href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
              className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
            >
              Call {site.phone}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});
    startTransition(async () => {
      const result = await submitReview(token, {
        rating,
        text,
        authorName,
        consent: consent as true,
      });
      if (result.ok) {
        setDone(result.rating);
      } else {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  const shown = hovered || rating;

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <fieldset>
            <legend className="text-sm font-medium">
              How was your {serviceTitle.toLowerCase()} visit?
            </legend>
            <div
              className="mt-3 flex items-center gap-1"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHovered(value)}
                  onFocus={() => setHovered(value)}
                  onBlur={() => setHovered(0)}
                  aria-label={`${value} star${value === 1 ? "" : "s"} — ${RATING_LABELS[value - 1]}`}
                  aria-pressed={rating === value}
                  className="rounded-md p-1 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      "size-9 transition-colors",
                      value <= shown
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-medium text-muted-foreground">
                {shown ? RATING_LABELS[shown - 1] : "Tap a star"}
              </span>
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-destructive">{errors.rating}</p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="review-text">Tell us a little more</Label>
            <Textarea
              id="review-text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What went well, and what could we do better?"
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? "review-text-error" : undefined}
            />
            {errors.text && (
              <p id="review-text-error" className="text-sm text-destructive">
                {errors.text}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-name">Name shown with your review</Label>
            <Input
              id="review-name"
              className="h-11"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              aria-invalid={!!errors.authorName}
            />
            <p className="text-xs text-muted-foreground">
              Plenty of patients use their first name and last initial.
            </p>
            {errors.authorName && (
              <p className="text-sm text-destructive">{errors.authorName}</p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span className="text-muted-foreground">
                {site.name} may publish this review, with the name above, on its
                website.
              </span>
            </label>
            {errors.consent && (
              <p className="mt-1 text-sm text-destructive">{errors.consent}</p>
            )}
          </div>

          {formError && (
            <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full bg-cta text-cta-foreground hover:bg-cta/90"
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Submit my rating
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
