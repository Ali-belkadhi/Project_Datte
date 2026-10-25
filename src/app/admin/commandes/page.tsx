import { PageHeader } from "@/components/layout/page-header";
import { OrdersOverview } from "@/features/commandes/admin";
import { pageMetadata } from "@/lib/seo";
import { statistiquesCommandes, toutesCommandes } from "@/server/modules/commandes/services/commandes";
import type { StatutCommande } from "@/types/enums";

export const metadata = pageMetadata("Commandes");

/** Vue globale des commandes (module C). */
export default async function AdminCommandesPage({ searchParams }: { searchParams: Promise<{ statut?: StatutCommande }> }) {
  const { statut } = await searchParams;
  const [commandes, stats] = await Promise.all([toutesCommandes({ statut }), statistiquesCommandes()]);
  return (
    <div className="space-y-6">
      <PageHeader surtitre="Administration" titre="Commandes" description="Toutes les commandes de la plateforme, leur paiement et leurs colis." />
      <OrdersOverview commandes={commandes} statut={statut} stats={stats} />
    </div>
  );
}
