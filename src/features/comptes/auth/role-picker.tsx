"use client";
import { Check } from "lucide-react";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { cn } from "@/lib/utils";

export type RoleInscription = "CLIENT" | "FOURNISSEUR";

/** Choix du rôle en deux grandes cartes illustrées. */
export function RolePicker({ value, onChange }: { value: RoleInscription; onChange: (r: RoleInscription) => void }) {
  const options = [
    { r: "CLIENT" as const, t: "J'achète des dattes", d: "Commandez chez les producteurs, suivez vos colis.", visuel: <ProductIllustration type="vrac" variete="deglet-nour" seed="role-client" /> },
    { r: "FOURNISSEUR" as const, t: "Je vends mes produits", d: "Ouvrez votre boutique, publiez en 3D, encaissez.", visuel: <ProductIllustration type="branchee" variete="medjool" seed="role-vendeur" /> },
  ];
  return (
    <div role="radiogroup" aria-label="Je souhaite" className="grid grid-cols-2 gap-3">
      {options.map((o) => {
        const actif = value === o.r;
        return (
          <button
            key={o.r}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(o.r)}
            className={cn("relative flex flex-col overflow-hidden rounded-2xl border-2 bg-card text-start transition-all", actif ? "border-brand-fill shadow-lift" : "border-border hover:border-ring/50")}
          >
            <span className="aspect-[4/3] bg-sand">{o.visuel}</span>
            <span className="space-y-1 p-3">
              <span className="block text-sm font-semibold sm:text-[15px]">{o.t}</span>
              <span className="block text-[12px] text-muted-foreground sm:text-[13px]">{o.d}</span>
            </span>
            {actif && (
              <span className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-brand-fill text-brand-foreground">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
