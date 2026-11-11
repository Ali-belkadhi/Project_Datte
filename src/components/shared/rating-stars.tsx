import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNote } from "@/lib/format";

type RatingStarsProps = {
  note: number;
  nombreAvis?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
};

/** Note sur 5 avec demi-étoiles, et nombre d'avis. */
export function RatingStars({ note, nombreAvis, size = "sm", showValue = true, className }: RatingStarsProps) {
  const px = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-flex" role="img" aria-label={`Note : ${formatNote(note)} sur 5`}>
        <span className="flex text-border">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(px, "fill-current")} aria-hidden />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-brand-fill" style={{ width: `${(Math.round(note * 2) / 2 / 5) * 100}%` }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn(px, "shrink-0 fill-current")} aria-hidden />
          ))}
        </span>
      </span>
      {showValue && note > 0 && <span className="text-[13px] font-semibold tabular-nums">{formatNote(note)}</span>}
      {nombreAvis !== undefined && <span className="text-[13px] text-muted-foreground">({nombreAvis})</span>}
    </span>
  );
}
