import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/section";
import { RetryPaymentButton } from "@/features/commandes/suivi";
import { formatPrix } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getCommande } from "@/server/modules/commandes/services/commandes";

export const metadata = pageMetadata("Paiement interrompu");

/** Retour « Annuler » depuis Stripe : la commande reste en attente de paiement (stock réservé 30 min). */
export default async function PaiementAnnulePage({ searchParams }: { searchParams: Promise<{ numero?: string }> }) {
  const { numero } = await searchParams;
  if (!numero) redirect("/panier");
  const commande = await getCommande(numero);
  if (!commande) redirect("/panier");
  if (commande.statut !== "EN_ATTENTE_PAIEMENT") redirect(`/compte/commandes/${numero}`);
  return (
    <Container className="max-w-xl space-y-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">Paiement interrompu</h1>
      <p className="text-muted-foreground">
        Votre commande <span className="font-mono font-semibold text-foreground">{numero}</span> ({formatPrix(commande.total)}) est enregistrée mais pas encore payée. Vos articles restent réservés pendant 30 minutes.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <RetryPaymentButton numero={numero} />
        <Button asChild variant="outline">
          <Link href={`/compte/commandes/${numero}`}>Voir la commande</Link>
        </Button>
      </div>
    </Container>
  );
}
