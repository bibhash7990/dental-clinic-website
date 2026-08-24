"use client";

import { useActionState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestMagicLink } from "@/lib/actions/portal";

export function PortalLogin() {
  const [state, formAction, isPending] = useActionState(requestMagicLink, {});

  if (state.sent) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MailCheck className="mx-auto size-12 text-cta" aria-hidden />
          <h2 className="mt-4 font-heading text-xl font-bold">Check your email</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If that address has an appointment with us, a sign-in link is on its
            way. It works once and expires in 20 minutes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="portal-email">Email address</Label>
            <Input
              id="portal-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5 h-11"
              aria-invalid={!!state.error}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Use the address you booked with — we&rsquo;ll email you a link, so
              there&rsquo;s no password to remember.
            </p>
          </div>

          {state.error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full bg-cta text-cta-foreground hover:bg-cta/90"
          >
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Email me a sign-in link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
