import { CalendarRange, Droplets, Hand, MapPin, Palette, Ruler, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Variete } from "@/types/domain";

/** Fiche d'identité d'une variété (complète ou résumée). */
export function VarietyFactSheet({ variete: v, resumee = false, className }: { variete: Variete; resumee?: boolean; className?: string }) {
  const lignes = [
    { icon: MapPin, k: "Origine", val: v.origine },
    { icon: Palette, k: "Couleur", val: v.couleur },
    { icon: Hand, k: "Texture", val: v.texture },
    { icon: Droplets, k: "Saveur", val: v.saveur },
    { icon: CalendarRange, k: "Saison", val: v.saison },
    { icon: Ruler, k: "Calibre", val: v.calibre },
    { icon: Utensils, k: "Usages", val: v.usages.join(", ") },
  ];
  return (
    <div className={cn("grid gap-6", !resumee && "md:grid-cols-[1fr_1.2fr]", className)}>
      {!resumee && <p className="text-[15px] leading-relaxed text-muted-foreground">{v.description}</p>}
      <dl className="grid gap-2 sm:grid-cols-2">
        {(resumee ? lignes.slice(0, 6) : lignes).map((l) => (
          <div key={l.k} className={cn("flex gap-3 rounded-xl bg-sand p-3", l.k === "Usages" && "sm:col-span-2")}>
            <l.icon className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{l.k}</dt>
              <dd className="text-sm font-medium">{l.val}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
