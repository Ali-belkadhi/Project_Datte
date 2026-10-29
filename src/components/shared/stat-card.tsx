import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVariation } from "@/lib/format";
import { Sparkline } from "./sparkline";

type StatCardProps = {
  label: string;
  value: string;
  variation?: number;
  serie?: number[];
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
};

/** Libellé, grande valeur en Fraunces, variation ±% (palm ou clay), mini sparkline. */
export function StatCard({ label, value, variation, serie, hint, icon, className }: StatCardProps) {
  const hausse = (variation ?? 0) >= 0;
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border bg-card p-4 md:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] leading-tight font-medium text-muted-foreground">{label}</span>
        {icon && <span className="grid size-8 place-items-center rounded-xl bg-brand-soft text-accent-foreground">{icon}</span>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-semibold tabular-nums sm:text-2xl md:text-[26px]">{value}</p>
          {variation !== undefined && (
            <p className={cn("mt-1 inline-flex items-center gap-1 text-[12px] font-semibold", hausse ? "text-success" : "text-danger")}>
              {hausse ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
              {formatVariation(variation)}
              <span className="hidden font-normal text-muted-foreground sm:inline">{hint ?? "vs période précédente"}</span>
            </p>
          )}
        </div>
        {serie && serie.length > 1 && <Sparkline values={serie} className={cn("h-8 w-full shrink-0 sm:h-10 sm:w-20", hausse ? "text-success" : "text-danger")} />}
      </div>
    </div>
  );
}
