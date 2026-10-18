"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Ban, Wheat } from "lucide-react";
import { PalmIcon } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Product3DViewer } from "@/components/three/product-3d-viewer";
import { IMG } from "@/data/products";
import type { Product3DConfig } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const THUMBNAILS = [
  { id: 0, label: "Vue 3D Fermé", src: IMG.prestigeLid, kind: "box" as const, front: IMG.lidTexture, back: IMG.innerLid },
  { id: 1, label: "Coffret Ouvert", src: IMG.prestigeOpen, kind: "box" as const, front: IMG.prestigeOpen, back: IMG.innerLid },
  { id: 2, label: "Détail Produits", src: "/images/products/coffret-decouverte.jpg", kind: "box" as const, front: "/images/products/coffret-decouverte.jpg", back: IMG.innerLid },
  { id: 3, label: "Dattes Fourrées", src: "/images/products/dattes-fourrees.jpg", kind: "box" as const, front: "/images/products/dattes-fourrees.jpg", back: IMG.innerLid },
];

export function ShowcaseSection() {
  const [activeThumb, setActiveThumb] = useState(0);

  const prev = () => setActiveThumb((i) => (i === 0 ? THUMBNAILS.length - 1 : i - 1));
  const next = () => setActiveThumb((i) => (i === THUMBNAILS.length - 1 ? 0 : i + 1));

  const current = THUMBNAILS[activeThumb];
  const viewerConfig: Product3DConfig = {
    kind: "box",
    front: current.front,
    back: current.back,
    size: [3.2, 2.2, 0.55],
  };

  return (
    <section className="relative w-full py-20 lg:py-28 bg-[#f2e9dc] overflow-hidden">
      <div className="container-lux">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Title & Specs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 flex flex-col items-start"
          >
            <PalmIcon className="size-8 text-forest" />
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-forest leading-tight">
              Coffret Prestige
            </h2>
            <p className="mt-4 text-base text-ink/75 leading-relaxed">
              Une expérience complète des saveurs de Kébili.
            </p>

            {/* Checklist */}
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3 text-sm font-medium text-forest">
                <span className="flex size-5 items-center justify-center rounded-full bg-forest text-cream">
                  <Check className="size-3" />
                </span>
                6 produits naturels
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-forest">
                <span className="flex size-5 items-center justify-center rounded-full bg-forest text-cream">
                  <Check className="size-3" />
                </span>
                Édition limitée
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-forest">
                <span className="flex size-5 items-center justify-center rounded-full bg-forest text-cream">
                  <Check className="size-3" />
                </span>
                Idéal pour offrir
              </li>
            </ul>

            <div className="mt-8">
              <Button asChild className="rounded-full bg-forest text-cream hover:bg-forest-700 px-6">
                <Link href="/produits/coffret-prestige">
                  Voir le coffret <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Center Column: 3D Experience + Pedestal + Thumbnails */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative h-[380px] sm:h-[460px] w-full">
              <Product3DViewer
                config={viewerConfig}
                fallbackImage={current.src}
                fallbackAlt="Coffret Prestige DEGLA"
                showPedestal={true}
                showDates={true}
                showGold={true}
                autoRotate={true}
                floating={false}
                cameraPosition={[0, 0.4, 4.6]}
                className="h-full w-full"
              />
            </div>

            {/* Bottom thumbnail slider with arrows matching screenshot */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Image précédente"
                onClick={prev}
                className="flex size-8 items-center justify-center rounded-full border border-forest/20 bg-cream-50 text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="flex items-center gap-2">
                {THUMBNAILS.map((thumb, idx) => (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => setActiveThumb(idx)}
                    className={cn(
                      "relative size-14 sm:size-16 overflow-hidden rounded-xl border-2 transition-all",
                      activeThumb === idx
                        ? "border-forest shadow-md scale-105"
                        : "border-forest/15 opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={thumb.src}
                      alt={thumb.label}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Image suivante"
                onClick={next}
                className="flex size-8 items-center justify-center rounded-full border border-forest/20 bg-cream-50 text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Circular Feature Badges from Screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 flex flex-col space-y-6 lg:pl-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-forest/25 bg-cream-50 text-forest shadow-xs">
                <Leaf className="size-6 text-forest" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold text-forest">100% Naturel</span>
                <span className="text-xs text-muted">Sans aucun additif chimique</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-forest/25 bg-cream-50 text-forest shadow-xs">
                <ShieldCheck className="size-6 text-forest" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold text-forest">Bio Certifié</span>
                <span className="text-xs text-muted">Agriculture biologique certifiée</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-forest/25 bg-cream-50 text-forest shadow-xs">
                <Ban className="size-6 text-forest" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold text-forest">Sans sucres ajoutés</span>
                <span className="text-xs text-muted">Uniquement le sucre du fruit</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-forest/25 bg-cream-50 text-forest shadow-xs">
                <Wheat className="size-6 text-forest" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold text-forest">Source de fibres</span>
                <span className="text-xs text-muted">Riche en nutriments essentiels</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
