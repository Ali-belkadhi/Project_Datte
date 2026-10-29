import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/features/catalogue/vendeur-produits";
import { pageMetadata } from "@/lib/seo";
import { ficheSuggereeDemo } from "@/server/modules/catalogue/services/produits";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";

export const metadata = pageMetadata("Ajouter un produit");
export const dynamic = "force-dynamic";

/** Création d'un produit dans l'espace fournisseur. */
export default async function AjouterProduitPage() {
  const boutique = await getMaBoutique();
  return (
    <div className="space-y-6">
      <PageHeader
        fil={[
          { label: "Mes produits", href: "/fournisseur/produits" },
          { label: "Ajouter" },
        ]}
        surtitre="Espace Fournisseur"
        titre="+ Ajouter un produit"
        description="Remplissez les informations de votre produit, téléchargez votre image et générez votre modèle 3D."
      />
      <ProductForm
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
