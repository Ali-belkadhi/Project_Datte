import Link from "next/link";
import { BadgeCheck, Box, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PalmPattern } from "@/components/brand/palm-pattern";
import { ProductIllustration } from "@/components/illustrations/product-illustration";
import { LazyHeroCluster, LazyScene } from "@/components/three";
import { HeroSearch } from "./hero-search";

/** Hero de l'accueil : fond night dégradé + palmes, texte à gauche, grappe 3D à droite (au-dessus sur mobile). */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-hero text-cream">
      <PalmPattern className="text-cream" opacity={0.07} />
      <div className="relative mx-auto grid max-w-7xl gap-2 px-4 pt-4 pb-14 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 lg:py-20">
        <div className="relative order-1 h-[300px] sm:h-[380px] lg:order-2 lg:h-[560px]">
          <LazyScene
            className="absolute inset-0 -mx-4 md:mx-0"
            eager
            fallback={<div className="mx-auto h-full max-w-sm"><ProductIllustration type="branchee" title="Grappe de Deglet Nour" /></div>}
          >
            <LazyHeroCluster />
          </LazyScene>
        </div>
        <div className="order-2 space-y-6 lg:order-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-light uppercase">Récolte 2026 · Tozeur, Kébili, Gabès</p>
          <h1 className="font-display text-5xl leading-[0.95] font-semibold text-balance md:text-7xl">
            Les plus belles dattes de Tunisie, directement des palmeraies.
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-cream/75">
            Deglet Nour translucides, Medjool fondantes, rob cuit au feu de bois : commandez chez les producteurs des oasis, voyez chaque produit en 3D, recevez-le
            partout en Tunisie.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href="/catalogue">Explorer le catalogue</Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href="/assistant">
                <Sparkles aria-hidden /> Parler à l&apos;assistant
              </Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[13px] text-cream/75">
            <li className="inline-flex items-center gap-2">
              <BadgeCheck className="size-4 text-brand-light" aria-hidden /> Vendeurs vérifiés
            </li>
            <li className="inline-flex items-center gap-2">
              <Box className="size-4 text-brand-light" aria-hidden /> Vue 3D
            </li>
            <li className="inline-flex items-center gap-2">
              <Truck className="size-4 text-brand-light" aria-hidden /> Livraison partout en Tunisie
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
