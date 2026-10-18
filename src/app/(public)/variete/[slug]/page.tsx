import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { Breadcrumbs } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { EmptyState } from "@/components/shared/empty-state";
import { LazyScene, LazySingleDate } from "@/components/three";
import { ShopCard } from "@/features/catalogue/boutiques";
import { ProductGrid } from "@/features/catalogue/produits";
import { MaturityScale, VarietyFactSheet } from "@/features/catalogue/varietes";
import { NoResults } from "@/components/illustrations/empty-illustrations";
import { pageMetadata } from "@/lib/seo";
import { produitsParVariete } from "@/server/modules/catalogue/services/produits";
import { getVariete, vendeursDeVariete } from "@/server/modules/catalogue/services/varietes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVariete(slug);
  return v ? pageMetadata(v.nom, v.resume) : pageMetadata("Variété introuvable");
}

/** Fiche variété (module B). */
export default async function VarietePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await getVariete(slug);
  if (!v) notFound();
  const [produits, vendeurs] = await Promise.all([produitsParVariete(v.slug), vendeursDeVariete(v.slug)]);

  return (
    <>
      <section className="relative overflow-hidden bg-hero text-cream">
        <PalmPattern className="text-cream" opacity={0.06} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-4 pt-6 pb-10 md:px-6 lg:grid-cols-2 lg:py-16">
          <div className="order-2 space-y-5 lg:order-1">
            <Breadcrumbs
              className="text-cream/60 [&_a:hover]:text-cream [&_[aria-current]]:text-cream"
              items={[
                { label: "Accueil", href: "/" },
                { label: "Variétés", href: "/varietes" },
                { label: v.nom },
              ]}
            />
            <p className="w-fit font-display text-2xl text-brand-light" lang="ar" dir="rtl">
              {v.nomArabe}
            </p>
            <h1 className="font-display text-5xl leading-[0.95] font-semibold md:text-7xl">{v.nom}</h1>
            <p className="inline-flex items-center gap-2 text-cream/75">
              <MapPin className="size-4" aria-hidden /> {v.origine} · {v.saison}
            </p>
            <p className="max-w-xl text-[17px] leading-relaxed text-cream/80">{v.description}</p>
          </div>
          <div className="relative order-1 h-72 sm:h-96 lg:order-2 lg:h-[460px]">
            <LazyScene className="absolute inset-0" eager fallback={<div className="grid size-full place-items-center"><VarietyGlyph variete={v.slug} className="size-40" /></div>}>
              <LazySingleDate variete={v.slug} label={`Datte ${v.nom} en 3D, en rotation lente`} />
            </LazyScene>
          </div>
        </div>
      </section>

      <Section surtitre="Fiche d'identité" titre={`La ${v.nom} en détail`}>
        <VarietyFactSheet variete={v} />
      </Section>
      <Section tone="sand" surtitre="Du palmier à la table" titre="Les stades de maturité" description="Une même datte change de goût et de texture au fil de sa maturation.">
        <MaturityScale variete={v.slug} />
      </Section>
      <Section titre={`Produits en ${v.nom}`} lien={{ href: `/catalogue?varietes=${v.slug}`, label: "Voir dans le catalogue" }}>
        {produits.length ? (
          <ProductGrid items={produits} />
        ) : (
          <EmptyState illustration={<NoResults />} titre="Pas encore en vente" texte={`Aucun vendeur ne propose de ${v.nom} pour le moment. Revenez à la prochaine récolte !`} />
        )}
      </Section>
      {vendeurs.length > 0 && (
        <Section tone="sand" titre="Les vendeurs qui la proposent">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vendeurs.map((b) => (
              <li key={b.id}>
                <ShopCard boutique={b} className="h-full" />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
