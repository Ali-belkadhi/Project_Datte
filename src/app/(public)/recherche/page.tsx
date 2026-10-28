import Link from "next/link";
import { Container } from "@/components/layout/section";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResults } from "@/components/illustrations/empty-illustrations";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { ShopCard } from "@/features/catalogue/boutiques";
import { ProductGrid } from "@/features/catalogue/produits";
import { SearchInput } from "@/features/catalogue/produits/search-input";
import { pageMetadata } from "@/lib/seo";
import { rechercher, RECHERCHES_POPULAIRES } from "@/server/modules/catalogue/services/recherche";

export const metadata = pageMetadata("Recherche", "Recherchez une variété, un produit ou une boutique sur DEGLA.");

/** Recherche (module B) : suggestions, recherches populaires, résultats groupés. */
export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const r = await rechercher(q);
  const total = r.varietes.length + r.produits.length + r.boutiques.length;

  return (
    <Container className="space-y-10 py-8 md:py-12">
      <PageHeader fil={[{ label: "Accueil", href: "/" }, { label: "Recherche" }]} titre={q ? `Résultats pour « ${q} »` : "Rechercher"} description={q ? `${total} résultat${total > 1 ? "s" : ""}` : "Une variété, un produit, une boutique ou une ville."} />
      <SearchInput key={q} initial={q} populaires={RECHERCHES_POPULAIRES} />

      {q && total === 0 ? (
        <EmptyState
          illustration={<NoResults />}
          titre="Rien trouvé dans nos palmeraies"
          texte="Vérifiez l'orthographe ou essayez une variété : Deglet Nour, Medjool, Alig…"
          action={
            <Button asChild>
              <Link href="/catalogue">Parcourir le catalogue</Link>
            </Button>
          }
        />
      ) : (
        <>
          {r.varietes.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">{q ? "Variétés" : "Suggestions de variétés"}</h2>
              <ul className="flex flex-wrap gap-2">
                {r.varietes.map((v) => (
                  <li key={v.slug}>
                    <Link href={`/variete/${v.slug}`} className="inline-flex h-12 items-center gap-2 rounded-full border bg-card ps-2 pe-4 text-sm font-semibold hover:bg-accent">
                      <VarietyGlyph variete={v.slug} className="size-8" />
                      {v.nom}
                      <span className="font-normal text-muted-foreground">· {v.origine}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {r.produits.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">{q ? `Produits (${r.produits.length})` : "Les mieux notés"}</h2>
              <ProductGrid items={r.produits} />
            </section>
          )}
          {r.boutiques.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl font-semibold">Boutiques</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {r.boutiques.map((b) => (
                  <li key={b.id}>
                    <ShopCard boutique={b} className="h-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Container>
  );
}
