import { notFound } from "next/navigation";
import { Container } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentGateway } from "@/features/commandes/checkout";
import { pageMetadata } from "@/lib/seo";
import { getPaiement } from "@/server/modules/commandes/services/paiements";

export const metadata = pageMetadata("Paiement");

/** Passerelle de paiement SIMULÉE (module C) — sera remplacée par la redirection vers l'API de paiement. */
export default async function PaiementPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const paiement = ref ? await getPaiement(ref) : null;
  if (!paiement) notFound();
  return (
    <Container className="max-w-lg space-y-8 py-8 md:py-12">
      <PageHeader fil={[{ label: "Commande", href: "/commande" }, { label: "Paiement" }]} titre="Paiement sécurisé" />
      <PaymentGateway reference={paiement.reference} montant={paiement.montant} numero={paiement.objet.reference} statut={paiement.statut} />
    </Container>
  );
}
