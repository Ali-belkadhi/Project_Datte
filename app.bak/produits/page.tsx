import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductCard } from "@/components/products/product-card";
import { ProductFiltersBar } from "@/components/products/product-filters";
import { getProducts, getAllProducts } from "@/lib/api/products";
import type { CategorySlug, SortOption } from "@/types";

interface ProduitsPageProps {
  searchParams: Promise<{
    categorie?: string;
    tri?: string;
    q?: string;
  }>;
}

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
  const params = await searchParams;
  const currentCategory = params.categorie as CategorySlug | undefined;
  const currentSort = params.tri as SortOption | undefined;
  const query = params.q;

  const allProducts = await getAllProducts();
  const products = await getProducts({
    categories: currentCategory ? [currentCategory] : undefined,
    sort: currentSort,
    query,
  });

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        eyebrow="TERROIR DE KÉBILI"
        title={query ? `Recherche : « ${query} »` : "Nos Produits d'Exception"}
        description="Dattes Deglet Nour, coffrets cadeaux, sirops traditionnels, pâtes et douceurs naturelles nées du désert tunisien."
        crumbs={[{ label: "Nos produits" }]}
      />

      <div className="container-lux mt-8">
        <Suspense fallback={null}>
          <ProductFiltersBar
            currentCategory={currentCategory}
            currentSort={currentSort}
            totalCount={allProducts.length}
          />
        </Suspense>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-2xl text-forest">Aucun produit trouvé</h3>
            <p className="mt-2 text-sm text-muted">Essayez d&apos;ajuster vos critères de recherche ou de filtre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
