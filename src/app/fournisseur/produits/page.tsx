import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/features/catalogue/vendeur-produits";
import { pageMetadata } from "@/lib/seo";
import { mesProduits } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Mes produits");
export const dynamic = "force-dynamic";

/** Espace Fournisseur : liste des produits du fournisseur connecté. */
export default async function FournisseurProduitsPage() {
  const produits = await mesProduits();
  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Espace Fournisseur"
        titre="Mes produits"
        description={`${produits.length} produit${produits.length > 1 ? "s" : ""} enregistré${produits.length > 1 ? "s" : ""} · Dattes au kilo et produits dérivés.`}
        actions={
          <Button asChild variant="brand">
            <Link href="/fournisseur/produits/ajouter">
              <Plus aria-hidden /> + Ajouter un produit
            </Link>
          </Button>
        }
      />
      <ProductTable produits={produits} />
    </div>
  );
}
