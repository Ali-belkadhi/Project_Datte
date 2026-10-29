import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/features/catalogue/vendeur-produits";
import { pageMetadata } from "@/lib/seo";
import { mesProduits } from "@/server/modules/catalogue/services/produits";

export const metadata = pageMetadata("Mes produits");

/** Produits du vendeur (module B). */
export default async function VendeurProduitsPage() {
  const produits = await mesProduits();
  return (
    <div className="space-y-6">
      <PageHeader
        surtitre="Catalogue"
        titre="Mes produits"
        description="Dattes au kilo et produits dérivés à l'unité."
        actions={
          <Button asChild variant="brand">
            <Link href="/vendeur/produits/nouveau">
              <Plus aria-hidden /> Nouveau produit
            </Link>
          </Button>
        }
      />
      <ProductTable produits={produits} />
    </div>
  );
}
