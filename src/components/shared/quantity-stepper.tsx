"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  size?: "compact" | "default";
  label?: string;
  className?: string;
};

/** − / valeur / + — compact (panier) ou standard (fiche produit). */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  format = String,
  size = "default",
  label = "Quantité",
  className,
}: QuantityStepperProps) {
  const compact = size === "compact";
  const btn = cn(
    "grid place-items-center rounded-full text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-35",
    compact ? "size-9" : "size-11",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border bg-card p-0.5", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Diminuer">
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className={cn("text-center font-semibold tabular-nums", compact ? "min-w-14 text-sm" : "min-w-16 text-[15px]")}>
        {format(value)}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} aria-label="Augmenter">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
