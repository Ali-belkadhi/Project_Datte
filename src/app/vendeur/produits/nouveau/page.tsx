import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/features/catalogue/vendeur-produits";
import { pageMetadata } from "@/lib/seo";
import { ficheSuggereeDemo } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Nouveau produit");

/** Création de produit (module B) — avec « Remplir avec l'IA » (IA-B simulée). */
export default function NouveauProduitPage() {
  return (
    <div className="space-y-6">
      <PageHeader fil={[{ label: "Produits", href: "/vendeur/produits" }, { label: "Nouveau" }]} titre="Nouveau produit" description="Ajoutez vos photos : l'IA peut pré-remplir la fiche pour vous." />
      <ProductForm fiche={ficheSuggereeDemo} />
    </div>
  );
}
