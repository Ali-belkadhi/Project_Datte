"use client";
import { useState } from "react";
import Link from "next/link";
import { CalendarClock, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/price-tag";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { RatingStars } from "@/components/shared/rating-stars";
import { WeightPicker } from "@/components/shared/weight-picker";
import { VARIETY_PRESETS } from "@/components/three/presets";
import { CATEGORIE_QUALITE, LIVRAISON, MATURITE, PRESENTATION, TYPE_DERIVE } from "@/lib/constants";
import { formatContenance, formatPoids, formatPrix, totalLigne } from "@/lib/format";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { ProduitAvecVendeur } from "@/types/domain";
import { FavoriteButton } from "@/components/shared/favorite-button";

/** Buy box (desktop à droite) + StickyBuyBar (mobile, au-dessus de la bottom nav) — état partagé. */
export function ProductPurchase({ item }: { item: ProduitAvecVendeur }) {
  const { produit: p } = item;
  const ajouter = useAddToCart();
  const datte = p.typeProduit === "DATTE";
  const [grammes, setGrammes] = useState(datte ? (p.optionsPoids.includes(1000) ? 1000 : p.optionsPoids[0]) : 0);
  const [unites, setUnites] = useState(1);
  const prix = datte ? p.prixParKg : p.prixUnitaire;
  const stock = datte ? p.stockGrammes : p.stockUnites;
  const rupture = stock <= 0 || p.statut === "RUPTURE";
  const sousTotal = datte ? totalLigne(prix, grammes) : prix * unites;
  const onAjouter = () => ajouter(item, datte ? { quantiteGrammes: grammes } : { quantiteUnites: unites });

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-2">
          {p.variete && (
            <Link href={`/variete/${p.variete}`} className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase hover:underline">
              {VARIETY_PRESETS[p.variete].nom}
            </Link>
          )}
          <h1 className="font-display text-3xl font-semibold text-balance md:text-4xl">{p.nom}</h1>
          {p.nombreAvis > 0 ? (
            <a href="#avis" className="inline-flex">
              <RatingStars note={p.noteMoyenne} nombreAvis={p.nombreAvis} size="md" />
            </a>
          ) : (
            <p className="text-[13px] text-muted-foreground">Pas encore d&apos;avis</p>
          )}
        </div>
        <PriceTag prixMillimes={prix} unite={datte ? "kg" : "unite"} size="lg" ancienPrix={p.remise ? Math.round(prix / (1 - p.remise / 100) / 100) * 100 : undefined} />
        <div className="flex flex-wrap gap-1.5">
          {datte ? (
            <>
              <Badge variant="brand">{CATEGORIE_QUALITE[p.categorieQualite]}</Badge>
              <Badge variant="secondary">
                {MATURITE[p.maturite].label} · {MATURITE[p.maturite].detail}
              </Badge>
              <Badge variant="secondary">{PRESENTATION[p.presentation]}</Badge>
              <Badge variant="secondary">Récolte {p.anneeRecolte}</Badge>
            </>
          ) : (
            <>
              <Badge variant="brand">{TYPE_DERIVE[p.typeDerive]}</Badge>
              <Badge variant="secondary">{formatContenance(p.contenance, p.uniteContenance)}</Badge>
            </>
          )}
          {p.bio && <Badge variant="success">Bio</Badge>}
        </div>

        <div className="space-y-4 rounded-2xl border bg-card p-4">
          {datte ? (
            <WeightPicker value={grammes} onChange={setGrammes} prixParKg={prix} options={p.optionsPoids} max={Math.max(500, stock)} />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <QuantityStepper value={unites} onChange={setUnites} min={1} max={Math.max(1, stock)} />
              <p className="text-end text-[13px] text-muted-foreground">
                Sous-total
                <span className="block font-display text-lg font-semibold text-foreground tabular-nums">{formatPrix(sousTotal)}</span>
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="brand" size="lg" className="flex-1" onClick={onAjouter} disabled={rupture}>
              <ShoppingBag aria-hidden /> {rupture ? "Bientôt de retour" : "Ajouter au panier"}
            </Button>
            <FavoriteButton produitId={p.id} nom={p.nom} size="lg" />
          </div>
          <p className={rupture ? "text-sm font-semibold text-danger" : stock < (datte ? 15000 : 15) ? "text-sm font-semibold text-accent-foreground" : "text-sm text-success"}>
            <PackageCheck className="me-1.5 inline size-4" aria-hidden />
            {rupture ? "Rupture de stock — prochaine cueillette fin octobre" : datte ? `Plus que ${formatPoids(stock)} disponibles` : `Plus que ${stock} unités disponibles`}
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2.5">
            <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <strong className="font-semibold">Livraison standard</strong> · {LIVRAISON.standard.delai} · {formatPrix(LIVRAISON.standard.prix)}, offerte dès {formatPrix(LIVRAISON.gratuiteDes)} chez ce vendeur
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <strong className="font-semibold">Express</strong> · {LIVRAISON.express.delai} · {formatPrix(LIVRAISON.express.prix)}
            </span>
          </li>
        </ul>
      </div>

      {/* StickyBuyBar — mobile, au-dessus de la bottom nav */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-muted-foreground">{datte ? formatPoids(grammes) : `${unites} × ${formatPrix(prix)}`}</p>
            <p className="font-display text-xl font-semibold tabular-nums">{formatPrix(sousTotal)}</p>
          </div>
          <Button variant="brand" onClick={onAjouter} disabled={rupture}>
            <ShoppingBag aria-hidden /> Ajouter
          </Button>
        </div>
      </div>
    </>
  );
}
