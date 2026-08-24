import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  label,
  size = "md",
}: {
  value: number;
  label: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "size-3.5" : "size-4";
  return (
    <div className="flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            dimension,
            i < Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-border"
          )}
        />
      ))}
    </div>
  );
}
