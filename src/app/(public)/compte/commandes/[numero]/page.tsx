import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { OrderDetail } from "@/features/commandes/suivi";
import { STATUT_COMMANDE } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getCommande, lignesDejaNotees } from "@/server/modules/commandes/services/commandes";
import { numeroFacture } from "@/server/modules/commandes/services/factures";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  return pageMetadata(`Commande ${numero}`);
}

/** Détail d'une commande acheteur (module C). */
export default async function CommandeDetailPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const c = await getCommande(numero);
  if (!c) notFound();
  const [notees, facture] = await Promise.all([lignesDejaNotees(numero), numeroFacture(numero)]);
  return (
    <>
      <PageHeader
        fil={[{ label: "Mes commandes", href: "/compte/commandes" }, { label: c.numero }]}
        titre={`Commande ${c.numero}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            Passée le {formatDate(c.creeLe)} <StatusBadge status={STATUT_COMMANDE[c.statut]} />
          </span>
        }
      />
      <OrderDetail commande={c} lignesNotees={notees} facture={facture} />
    </>
  );
}
