"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product3DViewer } from "@/components/three/product-3d-viewer";
import { IMG } from "@/data/products";
import type { Product3DConfig } from "@/types";
import { motion } from "motion/react";

const heroViewerConfig: Product3DConfig = {
  kind: "box",
  front: IMG.prestigeOpen,
  back: IMG.innerLid,
  size: [3.2, 2.3, 0.6],
};

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20">
      {/* Background landscape image with soft gradient overlay matching reference */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={IMG.heroDesert}
          alt="Palmeraie et désert de Kébili, Tunisie"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[55%_65%]"
        />
        {/* Warm cream/beige tint gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-transparent lg:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-cream/40" />
      </div>

      <div className="container-lux relative flex flex-col lg:flex-row lg:items-center lg:justify-between min-h-[75vh]">
        {/* Left Column: Brand copy and badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl flex-1 lg:pr-8"
        >
          <span className="eyebrow block font-bold text-forest/80">
            100% NATUREL • KÉBILI • TUNISIA
          </span>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-forest leading-[1.08]">
            La richesse
            <br />
            naturelle du désert
          </h1>

          <p className="mt-5 text-base sm:text-lg text-ink/75 leading-relaxed max-w-lg">
            Des produits d&apos;exception à base de dattes, récoltés au cœur de Kébili.
          </p>

          <div className="mt-8 flex items-center">
            <Button asChild size="lg" className="rounded-full bg-forest text-cream hover:bg-forest-700 px-7 shadow-md">
              <Link href="/produits" className="flex items-center gap-2">
                Découvrir nos produits <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* 3 Circular Badges from screenshot */}
          <div className="mt-12 flex items-center gap-8 sm:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-forest/30 bg-cream/60 backdrop-blur-xs text-forest">
                <Leaf className="size-6 text-forest" />
              </div>
              <span className="mt-2 text-xs font-serif font-medium text-forest">
                100%<br />Naturel
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-forest/30 bg-cream/60 backdrop-blur-xs text-forest">
                <span className="font-serif font-bold text-sm tracking-wider">BIO</span>
              </div>
              <span className="mt-2 text-xs font-serif font-medium text-forest">
                Bio<br />Certifié
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-forest/30 bg-cream/60 backdrop-blur-xs text-forest">
                <MapPin className="size-6 text-forest" />
              </div>
              <span className="mt-2 text-xs font-serif font-medium text-forest">
                Produit<br />de Kébili
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Experience on natural pedestal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative mt-8 h-[420px] sm:h-[500px] lg:mt-0 lg:h-[620px] flex-1 w-full"
        >
          <Product3DViewer
            config={heroViewerConfig}
            fallbackImage={IMG.prestigeOpen}
            fallbackAlt="Coffret Prestige SIWAR"
            showPedestal={true}
            showDates={true}
            showGold={true}
            autoRotate={true}
            floating={true}
            cameraPosition={[0, 0.4, 4.8]}
            className="h-full w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}
