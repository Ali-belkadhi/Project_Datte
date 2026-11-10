import Link from "next/link";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ShopCard } from "@/features/catalogue/boutiques";
import { ProductGrid } from "@/features/catalogue/produits";
import { pageMetadata } from "@/lib/seo";
import { mesFavoris } from "@/server/modules/catalogue/services/favoris";

export const metadata = pageMetadata("Mes favoris");

/** Favoris (module B) : produits et boutiques. */
export default async function FavorisPage() {
  const { produits, boutiques } = await mesFavoris();
  return (
    <>
      <PageHeader surtitre="Mon compte" titre="Mes favoris" />
      <Tabs defaultValue="produits" className="gap-5">
        <TabsList>
          <TabsTrigger value="produits">Produits ({produits.length})</TabsTrigger>
          <TabsTrigger value="boutiques">Boutiques ({boutiques.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="produits">
          {produits.length ? (
            <ProductGrid items={produits} colonnes={3} />
          ) : (
            <EmptyState
              illustration={<Heart className="mx-auto size-16 text-brand-fill" />}
              titre="Aucun favori"
              texte="Touchez le cœur d'un produit pour le retrouver ici."
              action={
                <Button asChild>
                  <Link href="/catalogue">Parcourir le catalogue</Link>
                </Button>
              }
            />
          )}
        </TabsContent>
        <TabsContent value="boutiques">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {boutiques.map((b) => (
              <li key={b.id}>
                <ShopCard boutique={b} className="h-full" />
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </>
  );
}
