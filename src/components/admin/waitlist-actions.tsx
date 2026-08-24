"use client";

import { useTransition } from "react";
import { CalendarCheck, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setWaitlistStatus } from "@/lib/actions/admin";

export function WaitlistActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const set = (next: string, message: string) =>
    startTransition(async () => {
      await setWaitlistStatus(id, next);
      toast.success(message);
    });

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
      )}
      {status !== "BOOKED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => set("BOOKED", "Marked as booked")}
        >
          <CalendarCheck aria-hidden />
          Booked
        </Button>
      )}
      {status === "NOTIFIED" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => set("ACTIVE", "Back on the active list")}
        >
          <RotateCcw aria-hidden />
          Keep waiting
        </Button>
      )}
      {status !== "CLOSED" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => set("CLOSED", "Removed from the waitlist")}
        >
          <X aria-hidden />
          Remove
        </Button>
      )}
    </div>
  );
}
