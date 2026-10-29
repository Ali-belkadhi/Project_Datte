import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateCourte } from "@/lib/format";
import type { EtapeSuivi } from "@/types/domain";

type TimelineProps = {
  etapes: EtapeSuivi[];
  /** auto : verticale sur mobile, horizontale dès md. */
  orientation?: "auto" | "vertical" | "horizontal";
  compact?: boolean;
  className?: string;
};

/** Étapes terminée / en cours / à venir. */
export function Timeline({ etapes, orientation = "auto", compact = false, className }: TimelineProps) {
  const horiz = orientation === "horizontal";
  const auto = orientation === "auto";
  return (
    <ol
      className={cn(
        "flex gap-0",
        horiz ? "flex-row" : "flex-col",
        auto && "md:flex-row",
        className,
      )}
    >
      {etapes.map((e, i) => {
        const dernier = i === etapes.length - 1;
        return (
          <li
            key={e.cle}
            className={cn(
              "relative flex gap-3",
              horiz ? "flex-1 flex-col items-center text-center" : "pb-5 last:pb-0",
              auto && "md:flex-1 md:flex-col md:items-center md:pb-0 md:text-center",
            )}
            aria-current={e.etat === "en-cours" ? "step" : undefined}
          >
            {!dernier && (
              <span
                aria-hidden
                className={cn(
                  "absolute bg-border",
                  horiz ? "start-1/2 top-3.5 h-0.5 w-full" : "start-3.5 top-8 h-[calc(100%-2rem)] w-0.5",
                  auto && "md:start-1/2 md:top-3.5 md:h-0.5 md:w-full",
                  e.etat === "terminee" && "bg-success",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2 bg-card text-[12px] font-bold",
                e.etat === "terminee" && "border-success bg-success text-cream",
                e.etat === "en-cours" && "border-brand-fill text-brand ring-4 ring-brand-soft",
                e.etat === "a-venir" && "border-border text-muted-foreground",
              )}
            >
              {e.etat === "terminee" ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("min-w-0", (horiz || auto) && "md:px-1")}>
              <span className={cn("block font-semibold", compact ? "text-[13px]" : "text-sm", e.etat === "a-venir" && "text-muted-foreground")}>
                {e.libelle}
              </span>
              {!compact && (
                <span className="block text-[12px] text-muted-foreground">
                  {e.date ? formatDateCourte(e.date) : e.etat === "en-cours" ? "En cours" : "À venir"}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
