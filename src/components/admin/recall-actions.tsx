"use client";

import { useTransition } from "react";
import { BellOff, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendRecall, setRecallOptOut } from "@/lib/actions/admin";

export function RecallActions({
  patientId,
  hasEmail,
  alreadySent,
}: {
  patientId: string;
  hasEmail: boolean;
  alreadySent: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={alreadySent ? "outline" : "default"}
        disabled={isPending || !hasEmail}
        title={hasEmail ? undefined : "No email address on file — call instead"}
        onClick={() =>
          startTransition(async () => {
            const result = await sendRecall(patientId);
            if (result.ok) toast.success("Recall email sent");
            else toast.error(result.error);
          })
        }
      >
        {isPending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Send aria-hidden />
        )}
        {alreadySent ? "Send again" : "Send recall"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setRecallOptOut(patientId, true);
            toast.success("Removed from recall campaigns");
          })
        }
      >
        <BellOff aria-hidden />
        Opt out
      </Button>
    </div>
  );
}
