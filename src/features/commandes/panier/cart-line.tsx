"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WeightPicker } from "@/components/shared/weight-picker";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { formatPrix, totalLigne } from "@/lib/format";
import type { LignePanier } from "@/types/domain";

type CartLineProps = {
  ligne: LignePanier;
  onQuantite: (q: { quantiteGrammes?: number; quantiteUnites?: number }) => void;
  onRetirer: () => void;
};

/** Ligne de panier : illustration, nom, WeightPicker compact (datte) ou stepper (dérivé), prix, supprimer. */
export function CartLine({ ligne: l, onQuantite, onRetirer }: CartLineProps) {
  const datte = l.typeProduit === "DATTE";
  return (
    <li className="flex gap-3 py-4 first:pt-0 last:pb-0">
      <Link href={`/produit/${l.slug}`} className="size-20 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-24">
        <ProductIllustration type={l.visuel} variete={l.variete} seed={l.slug} title={l.nom} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/produit/${l.slug}`} className="line-clamp-2 text-[15px] font-semibold hover:underline">
              {l.nom}
            </Link>
            <p className="text-[13px] text-muted-foreground">
              {l.variete ? `${VARIETY_PRESETS[l.variete].nom} · ` : ""}
              {formatPrix(l.prix)}
              {datte ? " /kg" : " l'unité"}
            </p>
          </div>
          <button type="button" onClick={onRetirer} className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-danger-soft hover:text-danger" aria-label={`Retirer « ${l.nom} » du panier`}>
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          {datte ? (
            <WeightPicker compact value={l.quantiteGrammes ?? 1000} onChange={(g) => onQuantite({ quantiteGrammes: g })} prixParKg={l.prix} max={Math.max(500, l.stockMax)} />
          ) : (
            <QuantityStepper size="compact" value={l.quantiteUnites ?? 1} onChange={(u) => onQuantite({ quantiteUnites: u })} max={Math.max(1, l.stockMax)} />
          )}
          <span className="font-display text-lg font-semibold tabular-nums">{formatPrix(totalLigne(l.prix, l.quantiteGrammes, l.quantiteUnites))}</span>
        </div>
      </div>
    </li>
  );
}
