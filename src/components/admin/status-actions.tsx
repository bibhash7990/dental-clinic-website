"use client";

import { useTransition } from "react";
import { Check, Loader2, RotateCcw, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/lib/actions/admin";

export function StatusActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  const set = (next: string) =>
    startTransition(() => updateAppointmentStatus(id, next));

  if (isPending) {
    return (
      <span className="inline-flex h-7 items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Saving…
      </span>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status === "PENDING" && (
        <>
          <Button size="sm" onClick={() => set("CONFIRMED")}>
            <Check aria-hidden />
            Confirm
          </Button>
          <Button size="sm" variant="destructive" onClick={() => set("CANCELLED")}>
            <X aria-hidden />
            Cancel
          </Button>
        </>
      )}
      {status === "CONFIRMED" && (
        <>
          <Button size="sm" variant="secondary" onClick={() => set("ARRIVED")}>
            <UserCheck aria-hidden />
            Arrived
          </Button>
          <Button size="sm" variant="destructive" onClick={() => set("NO_SHOW")}>
            <X aria-hidden />
            No-show
          </Button>
        </>
      )}
      {status === "ARRIVED" && (
        <Button size="sm" onClick={() => set("COMPLETED")}>
          <Check aria-hidden />
          Complete
        </Button>
      )}
      {(status === "CANCELLED" || status === "COMPLETED" || status === "NO_SHOW") && (
        <Button size="sm" variant="ghost" onClick={() => set("PENDING")}>
          <RotateCcw aria-hidden />
          Reopen
        </Button>
      )}
    </div>
  );
}
