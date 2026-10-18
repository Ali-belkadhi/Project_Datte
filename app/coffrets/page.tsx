import { PageHeader } from "@/components/layout/page-header";
import { ProductCard } from "@/components/products/product-card";
import { getGiftBoxes } from "@/lib/api/products";
import { Check, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Coffrets Cadeaux de Luxe",
  description: "Découvrez notre collection de coffrets cadeaux DEGLA : Coffret Prestige, Coffret Découverte et Coffret Oasis.",
};

export default async function CoffretsPage() {
  const giftBoxes = await getGiftBoxes();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ÉDITIONS LIMITÉES & CADEAUX"
        title="Nos Coffrets d'Exception"
        description="Des assortiments raffinés présentés dans des écrins inspirés des oasis de Kébili. L'art d'offrir la noblesse du désert."
        crumbs={[{ label: "Coffrets" }]}
      />

      <div className="container-lux mt-12">
        {/* Grid of gift boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giftBoxes.map((box, idx) => (
            <ProductCard key={box.id} product={box} priority={idx === 0} />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-20 rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow block">GUIDE COMPARATIF</span>
            <h2 className="mt-2 font-serif text-3xl font-medium text-forest">
              Quel coffret choisir ?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Comparez les contenus et trouvez le cadeau parfait pour vos proches ou vos réceptions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-forest">
              <thead>
                <tr className="border-b border-forest/10 text-xs uppercase tracking-wider text-muted">
                  <th className="py-4 pr-4">Caractéristiques</th>
                  {giftBoxes.map((box) => (
                    <th key={box.id} className="py-4 px-4 font-serif text-base text-forest">
                      {box.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                <tr>
                  <td className="py-4 pr-4 font-medium">Prix</td>
                  {giftBoxes.map((box) => (
                    <td key={box.id} className="py-4 px-4 font-semibold text-gold-dark">
                      {formatPrice(box.price)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-medium">Nombre de créations</td>
                  {giftBoxes.map((box) => (
                    <td key={box.id} className="py-4 px-4">
                      {box.subtitle}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-medium">Écrin de luxe & dorure</td>
                  {giftBoxes.map((box) => (
                    <td key={box.id} className="py-4 px-4">
                      <Check className="size-4 text-gold" />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-medium">Dattes fourrées à la main</td>
                  {giftBoxes.map((box) => (
                    <td key={box.id} className="py-4 px-4">
                      {box.slug === "coffret-prestige" ? (
                        <Check className="size-4 text-gold" />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-medium">Action</td>
                  {giftBoxes.map((box) => (
                    <td key={box.id} className="py-4 px-4">
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={`/produits/${box.slug}`}>Voir le coffret</Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
