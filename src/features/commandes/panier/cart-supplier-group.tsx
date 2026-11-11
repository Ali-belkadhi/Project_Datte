"use client";
import { Store, Truck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { LIVRAISON } from "@/lib/constants";
import { formatPrix } from "@/lib/format";
import type { GroupePanier } from "@/lib/panier";
import { useCartStore } from "@/stores/cart-store";
import { majLignePanier, retirerDuPanier } from "@/server/modules/commandes/actions";
import { CartLine } from "./cart-line";

/** Groupe de lignes d'un même vendeur : en-tête, lignes, frais, barre « livraison offerte ». */
export function CartSupplierGroup({ groupe: g }: { groupe: GroupePanier }) {
  const majQuantite = useCartStore((s) => s.majQuantite);
  const retirer = useCartStore((s) => s.retirer);
  const progression = Math.min(100, (g.sousTotal / LIVRAISON.gratuiteDes) * 100);
  return (
    <section className="rounded-2xl border bg-card" aria-label={`Articles de ${g.fournisseurNom}`}>
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <p className="flex min-w-0 items-center gap-2 font-semibold">
          <Store className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{g.fournisseurNom}</span>
          {g.fournisseurVerifie && <VerifiedBadge iconOnly />}
        </p>
        <span className="text-[13px] text-muted-foreground">{g.lignes.length} article{g.lignes.length > 1 ? "s" : ""}</span>
      </header>
      <ul className="divide-y px-4 py-4">
        {g.lignes.map((l) => (
          <CartLine
            key={l.id}
            ligne={l}
            onQuantite={(q) => {
              majQuantite(l.id, q);
              void majLignePanier({ ligneId: l.id, ...q });
            }}
            onRetirer={() => {
              retirer(l.id);
              void retirerDuPanier({ produitId: l.produitId });
            }}
          />
        ))}
      </ul>
      <footer className="space-y-2 border-t bg-sand/50 px-4 py-3 text-[13px]">
        <p className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-4 text-muted-foreground" aria-hidden /> Livraison {LIVRAISON.standard.label.toLowerCase()} · {LIVRAISON.standard.delai}
          </span>
          <span className="font-semibold tabular-nums">{g.frais === 0 ? "Offerte" : formatPrix(g.frais)}</span>
        </p>
        {g.resteAvantGratuite > 0 ? (
          <div className="space-y-1.5">
            <p className="text-muted-foreground">
              Plus que <strong className="text-foreground tabular-nums">{formatPrix(g.resteAvantGratuite)}</strong> pour la livraison offerte
            </p>
            <Progress value={progression} className="h-1.5" aria-label="Progression vers la livraison offerte" />
          </div>
        ) : (
          <p className="font-semibold text-success">Livraison offerte chez ce vendeur</p>
        )}
      </footer>
    </section>
  );
}
