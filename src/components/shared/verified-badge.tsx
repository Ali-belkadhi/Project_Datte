import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Coche + « Vendeur vérifié », couleur palm. `iconOnly` pour les cartes serrées. */
export function VerifiedBadge({ iconOnly = false, className, label = "Vendeur vérifié" }: { iconOnly?: boolean; className?: string; label?: string }) {
  if (iconOnly) {
    return <BadgeCheck aria-label={label} className={cn("size-4 shrink-0 text-success", className)} />;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[12px] font-semibold text-success", className)}>
      <BadgeCheck className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
