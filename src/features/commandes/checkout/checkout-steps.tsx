"use client";
import { Banknote, CreditCard, Lock, Map as MapIcon, Package, Truck, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AddressCard } from "@/components/shared/address-card";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { LIVRAISON } from "@/lib/constants";
import { formatPoids, formatPrix, totalLigne } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GroupePanier } from "@/lib/panier";
import type { Adresse } from "@/types/domain";
import type { AdresseLivraisonInput } from "@/lib/validation/commandes";
import { MapAddressForm } from "./map-address-form";

export type ModeLivraison = "standard" | "express";
export type MoyenPaiement = "CARTE" | "A_LA_LIVRAISON";

/** Valeur de `AddressStep` quand le client choisit son adresse sur la carte. */
export const ADRESSE_CARTE = "carte";

/**
 * Étape 1 — adresse : cartes sélectionnables, option « Choisir sur la carte » (OpenStreetMap)
 * et « Nouvelle adresse » (slot fourni par la page).
 */
export function AddressStep({
  adresses,
  valeur,
  onChange,
  nouvelleAdresse,
  adresseCarte,
  onAdresseCarte,
}: {
  adresses: Adresse[];
  valeur: string;
  onChange: (id: string) => void;
  nouvelleAdresse?: React.ReactNode;
  adresseCarte?: AdresseLivraisonInput | null;
  onAdresseCarte?: (a: AdresseLivraisonInput | null) => void;
}) {
  const parDefaut = adresses.find((a) => a.parDefaut) ?? adresses[0];
  return (
    <div className="space-y-4">
      <RadioGroup value={valeur} onValueChange={onChange} className="grid gap-3 sm:grid-cols-2" aria-label="Adresse de livraison">
        {adresses.map((a) => (
          <Label key={a.id} htmlFor={`adr-${a.id}`} className="block cursor-pointer">
            <RadioGroupItem id={`adr-${a.id}`} value={a.id} className="sr-only" />
            <AddressCard adresse={a} selectionnee={valeur === a.id} className="hover:border-ring/60" />
          </Label>
        ))}
        {onAdresseCarte && (
          <Label htmlFor="adr-carte" className="block cursor-pointer">
            <RadioGroupItem id="adr-carte" value={ADRESSE_CARTE} className="sr-only" />
            <span
              className={cn(
                "flex h-full items-start gap-3 rounded-2xl border-2 bg-card p-4 hover:border-ring/60",
                valeur === ADRESSE_CARTE ? "border-brand-fill" : "border-border",
              )}
            >
              <MapIcon className="size-6 shrink-0 text-accent-foreground" aria-hidden />
              <span>
                <span className="block font-semibold">Choisir sur la carte</span>
                <span className="block text-[13px] font-normal text-muted-foreground">Votre position actuelle ou un point précis, modifiable</span>
              </span>
            </span>
          </Label>
        )}
      </RadioGroup>
      {valeur === ADRESSE_CARTE && onAdresseCarte && (
        <MapAddressForm initial={adresseCarte ?? { destinataire: parDefaut?.destinataire, telephone: parDefaut?.telephone }} onChange={onAdresseCarte} />
      )}
      {nouvelleAdresse}
    </div>
  );
}

/** Adresse saisie sur la carte → forme affichable (récapitulatif). */
export function adresseDepuisCarte(a: AdresseLivraisonInput): Adresse {
  return { ...a, id: ADRESSE_CARTE, libelle: "Adresse choisie sur la carte", parDefaut: false };
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

/** Étape 3 — paiement : carte bancaire via Stripe (page sécurisée hébergée) ou à la livraison. */
export function PaymentStep({ valeur, onChange }: { valeur: MoyenPaiement; onChange: (m: MoyenPaiement) => void }) {
  return (
    <div className="space-y-4">
      <RadioGroup value={valeur} onValueChange={(v) => onChange(v as MoyenPaiement)} className="grid gap-3 sm:grid-cols-2" aria-label="Moyen de paiement">
        {[
          { v: "CARTE" as const, t: "Carte bancaire", d: "Visa, Mastercard · paiement sécurisé Stripe", icon: CreditCard },
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
      {valeur === "CARTE" && (
        <div className="space-y-2 rounded-2xl border bg-card p-4 text-[13px] text-muted-foreground">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-accent-foreground">
            <Lock className="size-3.5" aria-hidden /> Paiement sécurisé par Stripe
          </p>
          <p>
            Après confirmation, vous serez redirigé vers la page de paiement Stripe. Vos données de carte ne transitent jamais par DEGLA. Le montant est débité en euros au taux en vigueur.
          </p>
          <p>
            Mode test : carte <span className="font-mono text-foreground">4242 4242 4242 4242</span>, date future, n&apos;importe quel cryptogramme.
          </p>
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
          <p className="text-muted-foreground">{paiement === "CARTE" ? "Carte bancaire (Stripe)" : "Paiement à la livraison"}</p>
        </div>
      </div>
    </div>
  );
}
