"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, MessageSquare, Star, StarOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { moderateReview, replyToReview } from "@/lib/actions/admin";

type Action = "APPROVE" | "REJECT" | "PENDING" | "FEATURE" | "UNFEATURE";

export function ReviewActions({
  id,
  status,
  featured,
  reply,
}: {
  id: string;
  status: string;
  featured: boolean;
  reply: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [showReply, setShowReply] = useState(false);
  const [draft, setDraft] = useState(reply ?? "");

  const run = (action: Action, message: string) =>
    startTransition(async () => {
      await moderateReview(id, action);
      toast.success(message);
    });

  const saveReply = () =>
    startTransition(async () => {
      await replyToReview(id, draft);
      setShowReply(false);
      toast.success(draft.trim() ? "Reply published" : "Reply removed");
    });

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap gap-2">
        {isPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
        )}
        {status !== "APPROVED" && (
          <Button
            size="sm"
            disabled={isPending}
            className="bg-cta text-cta-foreground hover:bg-cta/90"
            onClick={() => run("APPROVE", "Review published")}
          >
            <Check aria-hidden />
            Publish
          </Button>
        )}
        {status !== "REJECTED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run("REJECT", "Review hidden")}
          >
            <X aria-hidden />
            {status === "APPROVED" ? "Unpublish" : "Reject"}
          </Button>
        )}
        {status === "APPROVED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              featured
                ? run("UNFEATURE", "Removed from the home page")
                : run("FEATURE", "Featured on the home page")
            }
          >
            {featured ? <StarOff aria-hidden /> : <Star aria-hidden />}
            {featured ? "Unfeature" : "Feature"}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => setShowReply((v) => !v)}
        >
          <MessageSquare aria-hidden />
          {reply ? "Edit reply" : "Reply publicly"}
        </Button>
      </div>

      {showReply && (
        <div className="mt-3">
          <label htmlFor={`reply-${id}`} className="text-xs font-medium text-muted-foreground">
            Public response — shown under the review
          </label>
          <Textarea
            id={`reply-${id}`}
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-1.5"
            placeholder="Thank you for the kind words, Sarah — we'll pass this on to Dr Chen."
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" disabled={isPending} onClick={saveReply}>
              Save reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setDraft(reply ?? "");
                setShowReply(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
