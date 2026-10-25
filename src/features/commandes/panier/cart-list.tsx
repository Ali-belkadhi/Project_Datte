"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyBasket } from "@/components/illustrations/empty-illustrations";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrix } from "@/lib/format";
import { totauxPanier } from "@/lib/panier";
import { useCartStore } from "@/stores/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { CartSummary } from "./cart-summary";
import { CartSupplierGroup } from "./cart-supplier-group";

/** Panier complet : groupes par vendeur + récapitulatif (collant à droite / barre fixe en bas sur mobile). */
export function CartList() {
  const lignes = useCartStore((s) => s.lignes);
  const hydrate = useCartStore((s) => s.hydrate);
  const mounted = useMounted();
  const [remise, setRemise] = useState(0);

  if (!mounted || !hydrate) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]" aria-busy="true">
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (lignes.length === 0) {
    return (
      <EmptyState
        illustration={<EmptyBasket />}
        titre="Votre panier attend sa première poignée de dattes."
        texte="Parcourez les variétés de la récolte 2026 ou laissez l'assistant vous guider."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="brand">
              <Link href="/catalogue">Explorer le catalogue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/assistant">Demander à l&apos;assistant</Link>
            </Button>
          </div>
        }
      />
    );
  }

  const t = totauxPanier(lignes, remise);
  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:items-start lg:pb-0">
      <div className="space-y-4">
        {t.groupes.length > 1 && (
          <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm text-accent-foreground">
            Votre panier réunit {t.groupes.length} vendeurs : vous recevrez {t.groupes.length} colis, chacun avec son suivi.
          </p>
        )}
        {t.groupes.map((g) => (
          <CartSupplierGroup key={g.fournisseurId} groupe={g} />
        ))}
      </div>
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <CartSummary sousTotal={t.sousTotal} livraison={t.livraison} remise={remise} onRemise={setRemise} colis={t.groupes.length} lignes={lignes} />
      </div>
      <div className="lg:hidden">
        <CartSummary sousTotal={t.sousTotal} livraison={t.livraison} remise={remise} onRemise={setRemise} colis={t.groupes.length} cta={null} lignes={lignes} />
      </div>
      {/* barre fixe mobile */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            <p className="text-[12px] text-muted-foreground">Total · {t.groupes.length} colis</p>
            <p className="font-display text-xl font-semibold tabular-nums">{formatPrix(t.total)}</p>
          </div>
          <Button asChild variant="brand">
            <Link href="/commande">Passer la commande</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
