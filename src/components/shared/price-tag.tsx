import { cn } from "@/lib/utils";
import { formatMontant } from "@/lib/format";

type PriceTagProps = {
  prixMillimes: number;
  unite: "kg" | "unite";
  ancienPrix?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** « 18,500 DT /kg » : grand nombre en Fraunces, unité en petit muted. */
export function PriceTag({ prixMillimes, unite, ancienPrix, size = "md", className }: PriceTagProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-1.5", className)}>
      <span
        className={cn(
          "font-display font-semibold tabular-nums",
          size === "sm" && "text-base",
          size === "md" && "text-xl",
          size === "lg" && "text-3xl md:text-4xl",
        )}
      >
        {formatMontant(prixMillimes)}
        <span className={cn("ms-1 font-sans font-semibold", size === "lg" ? "text-base" : "text-[13px]")}>DT</span>
      </span>
      {unite === "kg" && <span className="text-[13px] text-muted-foreground">/kg</span>}
      {ancienPrix !== undefined && ancienPrix > prixMillimes && (
        <span className="text-[13px] text-muted-foreground tabular-nums line-through">{formatMontant(ancienPrix)} DT</span>
      )}
    </span>
  );
}
