"use client";
import { cn } from "@/lib/utils";

type Chip = { value: string; label: string; count?: number; icon?: React.ReactNode };

type FilterChipsProps = {
  chips: Chip[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
  ariaLabel?: string;
};

/** Chips défilables horizontalement, état actif en ink. */
export function FilterChips({ chips, value, onChange, className, ariaLabel = "Filtres" }: FilterChipsProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      {chips.map((c) => {
        const actif = c.value === value;
        return (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={actif}
            onClick={() => onChange(c.value)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
              actif ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
            )}
          >
            {c.icon}
            {c.label}
            {c.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", actif ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground")}>
                {c.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
