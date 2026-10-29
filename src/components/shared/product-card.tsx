"use client";
import Link from "next/link";
import { Box, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { PriceTag } from "@/components/shared/price-tag";
import { RatingStars } from "@/components/shared/rating-stars";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { CATEGORIE_QUALITE, TYPE_DERIVE } from "@/lib/constants";
import { formatContenance } from "@/lib/format";
import { cn } from "@/lib/utils";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { ProduitAvecVendeur } from "@/types/domain";
import { FavoriteButton } from "./favorite-button";

/** Carte produit : visuel, badges (3D, Bio, remise), favori, variété, vendeur vérifié, note, prix, ajout rapide. */
export function ProductCard({ item, className, compact = false }: { item: ProduitAvecVendeur; className?: string; compact?: boolean }) {
  const { produit: p, vendeur } = item;
  const ajouter = useAddToCart();
  const datte = p.typeProduit === "DATTE";
  const prix = datte ? p.prixParKg : p.prixUnitaire;
  const ancien = p.remise ? Math.round(prix / (1 - p.remise / 100) / 100) * 100 : undefined;
  const sousTitre = datte
    ? `${VARIETY_PRESETS[p.variete].nom} · ${CATEGORIE_QUALITE[p.categorieQualite]}`
    : `${TYPE_DERIVE[p.typeDerive]} · ${formatContenance(p.contenance, p.uniteContenance)}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 ease-(--ease-degla) hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-sand">
        <ProduitVisuel produit={p} className="transition-transform duration-300 group-hover:scale-[1.04]" />
        <div className="absolute start-2.5 top-2.5 flex flex-wrap gap-1.5">
          {p.modele3D && (
            <Badge variant="night" className="gap-1">
              <Box aria-hidden /> 3D
            </Badge>
          )}
          {p.bio && <Badge variant="success">Bio</Badge>}
          {p.remise && <Badge variant="danger">-{p.remise} %</Badge>}
        </div>
        <FavoriteButton produitId={p.id} nom={p.nom} className="absolute end-2.5 top-2.5" />
      </div>
      <div className={cn("flex flex-1 flex-col gap-1.5 p-3.5", compact && "p-3")}>
        <p className="truncate text-[12px] font-medium text-muted-foreground">{sousTitre}</p>
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold">
          <Link href={`/produit/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {p.nom}
          </Link>
        </h3>
        <p className="flex items-center gap-1 truncate text-[13px] text-muted-foreground">
          <span className="truncate">{vendeur.nomBoutique}</span>
          {vendeur.verifie && <VerifiedBadge iconOnly />}
        </p>
        {p.nombreAvis > 0 && <RatingStars note={p.noteMoyenne} nombreAvis={p.nombreAvis} />}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <PriceTag prixMillimes={prix} unite={datte ? "kg" : "unite"} ancienPrix={ancien} size={compact ? "sm" : "md"} />
          <button
            type="button"
            onClick={() => ajouter(item, datte ? { quantiteGrammes: 1000 } : { quantiteUnites: 1 })}
            className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-brand lg:h-10 lg:w-auto lg:gap-1.5 lg:px-3.5 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
            aria-label={`Ajouter « ${p.nom} » au panier`}
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden text-[13px] font-semibold lg:inline">Ajouter</span>
          </button>
        </div>
      </div>
    </article>
  );
}
