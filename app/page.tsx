import { HeroSection } from "@/components/home/hero-section";
import { CategoryRail } from "@/components/home/category-rail";
import { BestSellers } from "@/components/home/best-sellers";
import { ShowcaseSection } from "@/components/home/showcase-section";
import { StorySection } from "@/components/home/story-section";
import { getBestSellers } from "@/lib/api/products";

export default async function HomePage() {
  const bestSellers = await getBestSellers(4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Section 1 & 2: Hero Section with 3D Experience */}
      <HeroSection />

      {/* Section 3: Product Categories (6 circular items) */}
      <CategoryRail />

      {/* Section 4: Nos Meilleures Ventes */}
      <BestSellers products={bestSellers} />

      {/* Section 5: Coffret Prestige — 3D Showcase on Pedestal */}
      <ShowcaseSection />

      {/* Section 6: Notre Histoire (Cinematic Oasis) */}
      <StorySection />
    </div>
  );
}
