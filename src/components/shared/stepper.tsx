import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  etapes: string[];
  courante: number; // index 0
  className?: string;
};

/** Étapes numérotées avec barre de progression (onboarding, checkout, génération 3D). */
export function Stepper({ etapes, courante, className }: StepperProps) {
  const pct = etapes.length > 1 ? (courante / (etapes.length - 1)) * 100 : 100;
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-[13px] md:hidden">
        <span className="font-semibold">
          Étape {courante + 1} sur {etapes.length} · {etapes[courante]}
        </span>
      </div>
      <div className="relative">
        <div className="absolute inset-x-4 top-4 hidden h-0.5 rounded-full bg-border md:block" aria-hidden>
          <div className="h-full rounded-full bg-brand-fill transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border md:hidden" aria-hidden>
          <div className="h-full rounded-full bg-brand-fill transition-[width] duration-300" style={{ width: `${((courante + 1) / etapes.length) * 100}%` }} />
        </div>
        <ol className="relative hidden justify-between md:flex">
          {etapes.map((e, i) => {
            const fait = i < courante;
            const actif = i === courante;
            return (
              <li key={e} className="flex flex-col items-center gap-2" aria-current={actif ? "step" : undefined}>
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border-2 bg-card text-[13px] font-bold transition-colors",
                    fait && "border-brand-fill bg-brand-fill text-brand-foreground",
                    actif && "border-brand-fill text-brand ring-4 ring-brand-soft",
                    !fait && !actif && "text-muted-foreground",
                  )}
                >
                  {fait ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("text-[13px] font-semibold", !fait && !actif && "text-muted-foreground")}>{e}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
