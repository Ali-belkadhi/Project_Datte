import { PageHeader } from "@/components/layout/page-header";
import { OrdersList } from "@/features/commandes/suivi";
import { pageMetadata } from "@/lib/seo";
import { mesCommandes } from "@/server/modules/commandes/services/commandes";

export const metadata = pageMetadata("Mes commandes");

/** Commandes acheteur (module C). */
export default async function CommandesPage() {
  const commandes = await mesCommandes();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Mes commandes" description="Suivez chaque colis, laissez un avis ou signalez un problème." />
      <OrdersList commandes={commandes} />
    </>
  );
}
