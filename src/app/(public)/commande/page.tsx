import { Container } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { AddressFormSheet } from "@/features/comptes/profil/address-form";
import { CheckoutStepper } from "@/features/commandes/checkout";
import { pageMetadata } from "@/lib/seo";
import { getAdresses } from "@/server/modules/comptes/services/utilisateurs";

export const metadata = pageMetadata("Commande", "Finalisez votre commande : adresse, livraison, paiement.");

/** Checkout (module C). Le formulaire d'adresse (module A) est passé en slot : aucune dépendance entre features. */
export default async function CommandePage() {
  const adresses = await getAdresses();
  return (
    <Container className="space-y-8 py-8 md:py-12">
      <PageHeader fil={[{ label: "Panier", href: "/panier" }, { label: "Commande" }]} titre="Finaliser ma commande" />
      <CheckoutStepper adresses={adresses} nouvelleAdresse={<AddressFormSheet />} />
    </Container>
  );
}
