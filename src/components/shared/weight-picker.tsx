"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { PAS_POIDS, POIDS_RAPIDES } from "@/lib/constants";
import { formatPoids, formatPrix, totalLigne } from "@/lib/format";
import { QuantityStepper } from "./quantity-stepper";

type WeightPickerProps = {
  value: number; // grammes
  onChange: (g: number) => void;
  prixParKg: number;
  options?: number[];
  max?: number;
  compact?: boolean;
  className?: string;
};

/** Options rapides (0,5 / 1 / 2 / 5 kg) + stepper par pas de 500 g, sous-total en direct. */
export function WeightPicker({ value, onChange, prixParKg, options = POIDS_RAPIDES, max = 50000, compact = false, className }: WeightPickerProps) {
  if (compact) {
    return (
      <QuantityStepper
        size="compact"
        value={value}
        onChange={onChange}
        min={PAS_POIDS}
        max={max}
        step={PAS_POIDS}
        format={formatPoids}
        label="Poids"
        className={className}
      />
    );
  }
  return (
    <div className={cn("space-y-3", className)}>
      <ToggleGroup
        type="single"
        value={options.includes(value) ? String(value) : ""}
        onValueChange={(v) => v && onChange(Number(v))}
        className="grid w-full grid-cols-4 gap-2"
        aria-label="Poids rapide"
      >
        {options.map((g) => (
          <ToggleGroupItem
            key={g}
            value={String(g)}
            disabled={g > max}
            className="rounded-xl border bg-card font-semibold data-[state=on]:border-primary"
          >
            {formatPoids(g)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex items-center justify-between gap-3">
        <QuantityStepper value={value} onChange={onChange} min={PAS_POIDS} max={max} step={PAS_POIDS} format={formatPoids} label="Poids" />
        <p className="text-end text-[13px] text-muted-foreground">
          Sous-total
          <span className="block font-display text-lg font-semibold text-foreground tabular-nums">
            {formatPrix(totalLigne(prixParKg, value))}
          </span>
        </p>
      </div>
    </div>
  );
}
