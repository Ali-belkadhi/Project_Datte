import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { ProductCard } from "@/components/products/product-card";
import { getProductBySlug, getRelatedProducts, getAllProducts } from "@/lib/api/products";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | SIWAR`,
      description: product.shortDescription,
      images: [product.images[0]?.src ?? ""],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="KÉBILI • TUNISIA"
        title={product.name}
        crumbs={[
          { href: "/produits", label: "Nos produits" },
          { label: product.name },
        ]}
      />

      <div className="container-lux mt-10">
        <ProductDetailClient product={product} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-forest/10 pt-16">
            <h2 className="font-serif text-3xl font-medium text-forest text-center md:text-left mb-8">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
