"use client";
import { useState } from "react";
import Link from "next/link";
import { Lock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrix } from "@/lib/format";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import type { LignePanier } from "@/types/domain";
import { appliquerCodePromo } from "@/server/modules/commandes/actions";

type CartSummaryProps = {
  sousTotal: number;
  livraison: number;
  remise: number;
  onRemise?: (millimes: number) => void;
  colis: number;
  cta?: { href: string; label: string } | null;
  promo?: boolean;
  /** Lignes du panier : le code promo est évalué par le serveur sur ces lignes. */
  lignes?: LignePanier[];
};

/** Récapitulatif : sous-total, livraison (somme des groupes), code promo (visuel), total, bouton. */
export function CartSummary({ sousTotal, livraison, remise, onRemise, colis, cta = { href: "/commande", label: "Passer la commande" }, promo = true, lignes = [] }: CartSummaryProps) {
  const setCodePromo = useCartStore((s) => s.setCodePromo);
  const [code, setCode] = useState(useCartStore.getState().codePromo ?? "");
  const { run, pending } = useAction(appliquerCodePromo, {
    silencieux: true,
    onSuccess: (d) => {
      onRemise?.(d.valide ? d.remise : 0);
      setCodePromo(d.valide ? d.code : null);
      if (d.valide) toast.success(`Code ${d.code} : ${d.message}`);
      else toast.error(d.message);
    },
  });
  const total = Math.max(0, sousTotal + livraison - remise);
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <h2 className="font-display text-xl font-semibold">Récapitulatif</h2>
      <dl className="space-y-2 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sous-total</dt>
          <dd className="tabular-nums">{formatPrix(sousTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Livraison ({colis} colis)
          </dt>
          <dd className="tabular-nums">{livraison === 0 ? "Offerte" : formatPrix(livraison)}</dd>
        </div>
        {remise > 0 && (
          <div className="flex justify-between text-success">
            <dt>Code promo</dt>
            <dd className="tabular-nums">−{formatPrix(remise)}</dd>
          </div>
        )}
      </dl>
      {promo && (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await run({ code, lignes: lignes.map((l) => ({ produitId: l.produitId, quantiteGrammes: l.quantiteGrammes, quantiteUnites: l.quantiteUnites })) });
          }}
        >
          <label htmlFor="code-promo" className="sr-only">
            Code promo
          </label>
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="code-promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="DEGLA10" className="ps-9 uppercase" />
          </div>
          <Button type="submit" variant="outline" disabled={!code || pending}>
            Appliquer
          </Button>
        </form>
      )}
      <Separator />
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Total</span>
        <span className="font-display text-2xl font-semibold tabular-nums">{formatPrix(total)}</span>
      </div>
      {cta && (
        <Button asChild variant="brand" size="lg" className="w-full">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
      <p className="flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
        <Lock className="size-3.5" aria-hidden /> Paiement sécurisé · Konnect, Flouci ou à la livraison
      </p>
    </div>
  );
}
