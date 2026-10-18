"use client";
import Link from "next/link";
import { Check, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProduitVisuel } from "@/components/illustrations/product-illustration";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { ProductCard } from "@/components/shared/product-card";
import { Timeline } from "@/components/shared/timeline";
import { formatPoids, formatPrix } from "@/lib/format";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { ResultatOutil } from "@/types/domain";

/** Résultats d'outils de l'assistant, rendus en composants. */
export function ToolResultCard({ resultat, resolu, onResoudre }: { resultat: ResultatOutil; resolu?: "confirme" | "annule"; onResoudre: (d: "confirme" | "annule") => void }) {
  const ajouter = useAddToCart();

  if (resultat.outil === "recherche") {
    return (
      <ul className="scrollbar-none -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
        {resultat.produits.map((item) => (
          <li key={item.produit.id} className="flex w-52 shrink-0 snap-start">
            <ProductCard item={item} compact className="w-full" />
          </li>
        ))}
      </ul>
    );
  }

  if (resultat.outil === "varietes") {
    const [a, b] = resultat.comparaison;
    const lignes: [string, string, string][] = [
      ["Origine", a.origine, b.origine],
      ["Couleur", a.couleur, b.couleur],
      ["Texture", a.texture, b.texture],
      ["Saveur", a.saveur, b.saveur],
      ["Saison", a.saison, b.saison],
    ];
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-2 divide-x border-b">
          {[a, b].map((v) => (
            <Link key={v.slug} href={`/variete/${v.slug}`} className="flex items-center gap-2 p-3 hover:bg-accent">
              <VarietyGlyph variete={v.slug} className="size-8" />
              <span className="font-display text-lg font-semibold">{v.nom}</span>
            </Link>
          ))}
        </div>
        <dl className="divide-y text-[13px]">
          {lignes.map(([k, va, vb]) => (
            <div key={k} className="grid grid-cols-2 divide-x">
              <div className="p-3">
                <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{k}</dt>
                <dd>{va}</dd>
              </div>
              <div className="p-3">
                <dt className="sr-only">{k}</dt>
                <dd className="pt-[18px]">{vb}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (resultat.outil === "suivi") {
    return (
      <div className="space-y-3 rounded-2xl border bg-card p-4">
        <p className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-mono text-[13px] font-semibold">{resultat.commandeNumero}</span>
          <span className="text-muted-foreground">{resultat.vendeur}</span>
        </p>
        <Timeline etapes={resultat.etapes} orientation="vertical" compact />
        <Button asChild variant="outline" size="sm">
          <Link href={`/compte/commandes/${resultat.commandeNumero}`}>Voir le détail</Link>
        </Button>
      </div>
    );
  }

  // ajout-panier : carte de CONFIRMATION
  const { produit } = resultat.produit;
  return (
    <div className="space-y-3 rounded-2xl border-2 border-brand-fill/40 bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
          <ProduitVisuel produit={produit} />
        </span>
        <p className="text-[15px] font-semibold">
          Ajouter {formatPoids(resultat.quantiteGrammes)} de {produit.nom} — {formatPrix(resultat.total)} ?
        </p>
      </div>
      {resolu ? (
        <p className={resolu === "confirme" ? "inline-flex items-center gap-1.5 text-sm font-semibold text-success" : "text-sm text-muted-foreground"}>
          {resolu === "confirme" ? (
            <>
              <Check className="size-4" aria-hidden /> Ajouté au panier
            </>
          ) : (
            "Ajout annulé"
          )}
        </p>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              ajouter(resultat.produit, { quantiteGrammes: resultat.quantiteGrammes });
              onResoudre("confirme");
            }}
          >
            <ShoppingBag aria-hidden /> Confirmer
          </Button>
          <Button variant="outline" size="sm" onClick={() => onResoudre("annule")}>
            <X aria-hidden /> Annuler
          </Button>
        </div>
      )}
    </div>
  );
}
