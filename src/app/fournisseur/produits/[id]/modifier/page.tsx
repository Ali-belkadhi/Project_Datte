import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProductForm } from "@/features/catalogue/vendeur-produits";
import { STATUT_PRODUIT } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { ficheSuggereeDemo, getMonProduit } from "@/server/modules/catalogue/services/produits";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Modifier le produit");
export const dynamic = "force-dynamic";

/** Modification d'un produit fournisseur existant. */
export default async function ModifierProduitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [produit, boutique] = await Promise.all([getMonProduit(id), getMaBoutique()]);
  if (!produit) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        fil={[
          { label: "Mes produits", href: "/fournisseur/produits" },
          { label: produit.nom },
          { label: "Modifier" },
        ]}
        surtitre="Espace Fournisseur"
        titre={`Modifier : ${produit.nom}`}
        description={<StatusBadge status={STATUT_PRODUIT[produit.statut]} />}
      />
      <ProductForm
        produit={produit}
        fiche={ficheSuggereeDemo}
        vendeur={{
          id: boutique.id,
          slug: boutique.slug,
          nomBoutique: boutique.nomBoutique,
          verifie: boutique.verifie,
          region: boutique.region,
          couleur: boutique.couleur,
        }}
      />
    </div>
  );
}
