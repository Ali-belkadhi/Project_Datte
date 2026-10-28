"use client";
import { Banknote, CreditCard, Lock, Package, Truck, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AddressCard } from "@/components/shared/address-card";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { LIVRAISON } from "@/lib/constants";
import { formatPoids, formatPrix, totalLigne } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GroupePanier } from "@/lib/panier";
import type { Adresse } from "@/types/domain";

export type ModeLivraison = "standard" | "express";
export type MoyenPaiement = "KONNECT" | "A_LA_LIVRAISON";

/** Étape 1 — adresse : cartes sélectionnables + « Nouvelle adresse » (slot fourni par la page). */
export function AddressStep({ adresses, valeur, onChange, nouvelleAdresse }: { adresses: Adresse[]; valeur: string; onChange: (id: string) => void; nouvelleAdresse?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <RadioGroup value={valeur} onValueChange={onChange} className="grid gap-3 sm:grid-cols-2" aria-label="Adresse de livraison">
        {adresses.map((a) => (
          <Label key={a.id} htmlFor={`adr-${a.id}`} className="block cursor-pointer">
            <RadioGroupItem id={`adr-${a.id}`} value={a.id} className="sr-only" />
            <AddressCard adresse={a} selectionnee={valeur === a.id} className="hover:border-ring/60" />
          </Label>
        ))}
      </RadioGroup>
      {nouvelleAdresse}
    </div>
  );
}

/** Étape 2 — livraison : options par vendeur (standard, express). */
export function DeliveryStep({ groupes, modes, onChange }: { groupes: GroupePanier[]; modes: Record<string, ModeLivraison>; onChange: (fournisseurId: string, m: ModeLivraison) => void }) {
  return (
    <div className="space-y-4">
      {groupes.map((g) => (
        <fieldset key={g.fournisseurId} className="space-y-3 rounded-2xl border bg-card p-4">
          <legend className="sr-only">Livraison — {g.fournisseurNom}</legend>
          <p className="flex items-center gap-2 font-semibold">
            <Package className="size-4 text-muted-foreground" aria-hidden /> Colis de {g.fournisseurNom}
          </p>
          <RadioGroup value={modes[g.fournisseurId] ?? "standard"} onValueChange={(v) => onChange(g.fournisseurId, v as ModeLivraison)} className="grid gap-2 sm:grid-cols-2">
            {(["standard", "express"] as const).map((m) => {
              const opt = LIVRAISON[m];
              const prix = m === "standard" ? g.frais : LIVRAISON.express.prix;
              const actif = (modes[g.fournisseurId] ?? "standard") === m;
              return (
                <Label key={m} htmlFor={`liv-${g.fournisseurId}-${m}`} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3", actif ? "border-brand-fill bg-brand-soft/40" : "border-border")}>
                  <RadioGroupItem id={`liv-${g.fournisseurId}-${m}`} value={m} />
                  {m === "standard" ? <Truck className="size-5 text-muted-foreground" aria-hidden /> : <Zap className="size-5 text-accent-foreground" aria-hidden />}
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-[12px] font-normal text-muted-foreground">{opt.delai}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{prix === 0 ? "Offerte" : formatPrix(prix)}</span>
                </Label>
              );
            })}
          </RadioGroup>
        </fieldset>
      ))}
    </div>
  );
}

/** Étape 3 — paiement : carte (Konnect / Flouci) ou à la livraison. Saisie VISUELLE, paiement simulé. */
export function PaymentStep({ valeur, onChange }: { valeur: MoyenPaiement; onChange: (m: MoyenPaiement) => void }) {
  return (
    <div className="space-y-4">
      <RadioGroup value={valeur} onValueChange={(v) => onChange(v as MoyenPaiement)} className="grid gap-3 sm:grid-cols-2" aria-label="Moyen de paiement">
        {[
          { v: "KONNECT" as const, t: "Carte bancaire", d: "Konnect / Flouci · Visa, Mastercard, e-dinar", icon: CreditCard },
          { v: "A_LA_LIVRAISON" as const, t: "Paiement à la livraison", d: "En espèces, à réception de chaque colis", icon: Banknote },
        ].map((o) => (
          <Label key={o.v} htmlFor={`pay-${o.v}`} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-card p-4", valeur === o.v ? "border-brand-fill" : "border-border")}>
            <RadioGroupItem id={`pay-${o.v}`} value={o.v} className="mt-1" />
            <o.icon className="size-6 shrink-0 text-accent-foreground" aria-hidden />
            <span>
              <span className="block font-semibold">{o.t}</span>
              <span className="block text-[13px] font-normal text-muted-foreground">{o.d}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      {valeur === "KONNECT" && (
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-accent-foreground">
            <Lock className="size-3.5" aria-hidden /> Paiement simulé — aucune donnée n&apos;est transmise
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="cb-num">Numéro de carte</Label>
            <Input id="cb-num" inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cb-exp">Expiration</Label>
              <Input id="cb-exp" placeholder="MM / AA" autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cb-cvc">Cryptogramme</Label>
              <Input id="cb-cvc" placeholder="123" autoComplete="off" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Étape 4 — vérification : récapitulatif complet. */
export function ReviewStep({ groupes, adresse, paiement, modes }: { groupes: GroupePanier[]; adresse?: Adresse; paiement: MoyenPaiement; modes: Record<string, ModeLivraison> }) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-accent-foreground">
        Votre commande sera envoyée en {groupes.length} colis{groupes.length > 1 ? ", un par vendeur" : ""}.
      </p>
      {groupes.map((g, i) => (
        <div key={g.fournisseurId} className="rounded-2xl border bg-card p-4">
          <p className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>
              Colis {i + 1} · {g.fournisseurNom}
            </span>
            <span className="text-muted-foreground">{LIVRAISON[modes[g.fournisseurId] ?? "standard"].label}</span>
          </p>
          <ul className="space-y-2">
            {g.lignes.map((l) => (
              <li key={l.id} className="flex items-center gap-3 text-sm">
                <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <ProductIllustration type={l.visuel} variete={l.variete} seed={l.slug} />
                </span>
                <span className="flex-1">
                  {l.nom}
                  <span className="block text-[12px] text-muted-foreground">{l.quantiteGrammes ? formatPoids(l.quantiteGrammes) : `${l.quantiteUnites} unité(s)`}</span>
                </span>
                <span className="font-semibold tabular-nums">{formatPrix(totalLigne(l.prix, l.quantiteGrammes, l.quantiteUnites))}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        {adresse && <AddressCard adresse={adresse} />}
        <div className="rounded-2xl border bg-card p-4 text-sm">
          <p className="font-semibold">Paiement</p>
          <p className="text-muted-foreground">{paiement === "KONNECT" ? "Carte bancaire (Konnect / Flouci) — simulé" : "Paiement à la livraison"}</p>
        </div>
      </div>
    </div>
  );
}
