import { PageHeader } from "@/components/layout/page-header";
import { IncomingOrdersTable } from "@/features/commandes/vendeur";
import { pageMetadata } from "@/lib/seo";
import { sousCommandesRecues } from "@/server/modules/commandes/services/commandes";

export const metadata = pageMetadata("Commandes reçues");

/** Commandes reçues (module C). */
export default async function VendeurCommandesPage() {
  const sousCommandes = await sousCommandesRecues();
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Ventes" titre="Commandes reçues" description="Acceptez, préparez et expédiez vos commandes. Le client est prévenu à chaque étape." />
      <IncomingOrdersTable sousCommandes={sousCommandes} />
    </div>
  );
}
