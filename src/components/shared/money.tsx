import { cn } from "@/lib/utils";
import { formatContenance, formatPoids, formatPrix } from "@/lib/format";

/** Montant formaté (millimes → « 18,500 DT »). */
export function Money({ value, className, signe = false }: { value: number; className?: string; signe?: boolean }) {
  return (
    <span className={cn("tabular-nums", className)}>
      {signe && value > 0 ? "+" : ""}
      {formatPrix(value)}
    </span>
  );
}

/** Poids formaté (grammes → « 1,5 kg »). */
export function Weight({ grams, className }: { grams: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatPoids(grams)}</span>;
}

/** Contenance (« 1 L », « 350 g »). */
export function Contenance({ valeur, unite, className }: { valeur: number; unite: "ML" | "G"; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatContenance(valeur, unite)}</span>;
}
