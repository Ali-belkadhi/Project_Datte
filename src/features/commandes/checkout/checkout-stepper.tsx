"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptyBasket } from "@/components/illustrations/empty-illustrations";
import { Stepper } from "@/components/shared/stepper";
import { LIVRAISON } from "@/lib/constants";
import { formatPrix } from "@/lib/format";
import { totauxPanier } from "@/lib/panier";
import { useAction } from "@/hooks/use-action";
import { useMounted } from "@/hooks/use-mounted";
import { useCartStore } from "@/stores/cart-store";
import type { Adresse } from "@/types/domain";
import { passerCommande } from "@/server/modules/commandes/actions";
import { CartSummary } from "../panier/cart-summary";
import { AddressStep, DeliveryStep, PaymentStep, ReviewStep, type ModeLivraison, type MoyenPaiement } from "./checkout-steps";

const ETAPES = ["Adresse", "Livraison", "Paiement", "Vérification"];

/** Checkout en 4 étapes : Adresse → Livraison → Paiement → Vérification. Récapitulatif latéral sur desktop. */
export function CheckoutStepper({ adresses, nouvelleAdresse }: { adresses: Adresse[]; nouvelleAdresse?: React.ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const lignes = useCartStore((s) => s.lignes);
  const vider = useCartStore((s) => s.vider);
  const [etape, setEtape] = useState(0);
  const [adresseId, setAdresseId] = useState(adresses.find((a) => a.parDefaut)?.id ?? adresses[0]?.id ?? "");
  const [modes, setModes] = useState<Record<string, ModeLivraison>>({});
  const [paiement, setPaiement] = useState<MoyenPaiement>("KONNECT");
  const { run, pending } = useAction(passerCommande, {
    onSuccess: ({ numero, urlPaiement }) => {
      router.push(urlPaiement ?? `/commande/confirmation?numero=${numero}`);
      setTimeout(vider, 400);
    },
  });

  if (mounted && lignes.length === 0) {
    return (
      <EmptyState
        illustration={<EmptyBasket />}
        titre="Votre panier est vide"
        texte="Ajoutez quelques dattes avant de passer commande."
        action={
          <Button asChild variant="brand">
            <Link href="/catalogue">Explorer le catalogue</Link>
          </Button>
        }
      />
    );
  }

  const t = totauxPanier(lignes);
  const livraison = t.groupes.reduce((a, g) => a + ((modes[g.fournisseurId] ?? "standard") === "express" ? LIVRAISON.express.prix : g.frais), 0);
  const suivant = () => {
    if (etape < 3) return setEtape(etape + 1);
    void run({
      lignes: lignes.map((l) => ({ produitId: l.produitId, quantiteGrammes: l.quantiteGrammes, quantiteUnites: l.quantiteUnites })),
      adresseId, livraison: Object.fromEntries(t.groupes.map((g) => [g.fournisseurId, modes[g.fournisseurId] ?? "standard"])), methodePaiement: paiement });
  };

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-[1fr_380px] lg:items-start lg:pb-0">
      <div className="space-y-6">
        <Stepper etapes={ETAPES} courante={etape} />
        <section aria-labelledby="etape-titre" className="space-y-4">
          <h2 id="etape-titre" className="font-display text-2xl font-semibold">
            {["Où livrer votre commande ?", "Comment souhaitez-vous être livré ?", "Comment souhaitez-vous payer ?", "Vérifiez votre commande"][etape]}
          </h2>
          {etape === 0 && <AddressStep adresses={adresses} valeur={adresseId} onChange={setAdresseId} nouvelleAdresse={nouvelleAdresse} />}
          {etape === 1 && <DeliveryStep groupes={t.groupes} modes={modes} onChange={(id, m) => setModes((x) => ({ ...x, [id]: m }))} />}
          {etape === 2 && <PaymentStep valeur={paiement} onChange={setPaiement} />}
          {etape === 3 && <ReviewStep groupes={t.groupes} adresse={adresses.find((a) => a.id === adresseId)} paiement={paiement} modes={modes} />}
        </section>
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          {etape > 0 && (
            <Button variant="outline" size="lg" onClick={() => setEtape(etape - 1)}>
              <ArrowLeft className="rtl:rotate-180" aria-hidden /> Retour
            </Button>
          )}
          <Button variant="brand" size="lg" className="flex-1 lg:flex-none" onClick={suivant} disabled={pending || !adresseId}>
            {etape < 3 ? (
              <>
                Continuer <ArrowRight className="rtl:rotate-180" aria-hidden />
              </>
            ) : pending ? (
              "Validation…"
            ) : (
              `Confirmer et payer ${formatPrix(t.sousTotal + livraison)}`
            )}
          </Button>
        </div>
      </div>
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        <CartSummary sousTotal={t.sousTotal} livraison={livraison} remise={0} colis={t.groupes.length} cta={null} promo={false} />
      </aside>
    </div>
  );
}
