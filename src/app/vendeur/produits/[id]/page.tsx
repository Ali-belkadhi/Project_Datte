import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductForm } from "@/features/catalogue/vendeur-produits";
import { STATUT_PRODUIT } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { ficheSuggereeDemo, getMonProduit } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Modifier le produit");

/** Édition d'un produit (module B). */
export default async function EditProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produit = await getMonProduit(id);
  if (!produit) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        fil={[{ label: "Produits", href: "/vendeur/produits" }, { label: produit.nom }]}
        titre={produit.nom}
        description={<StatusBadge status={STATUT_PRODUIT[produit.statut]} />}
      />
      <ProductForm produit={produit} fiche={ficheSuggereeDemo} />
    </div>
  );
}
