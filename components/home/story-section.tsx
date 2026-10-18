"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMG } from "@/data/products";
import { motion, AnimatePresence } from "motion/react";

export function StorySection() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative min-h-[520px] lg:min-h-[600px] w-full overflow-hidden flex items-center">
      {/* Cinematic Oasis Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={IMG.heroDesert}
          alt="Palmeraie de Kébili, Tunisie"
          fill
          sizes="100vw"
          className="object-cover object-[50%_70%]"
        />
        {/* Dark cinematic gradient matching reference */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/40 to-forest-950/30" />
        <div className="absolute inset-0 bg-forest/30 mix-blend-multiply" />
      </div>

      <div className="container-lux relative w-full py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          {/* Left Column: Story text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-cream"
          >
            <span className="eyebrow block font-bold text-gold-light">
              KÉBILI • TUNISIA
            </span>

            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-cream leading-tight">
              Un terroir unique,
              <br />
              des produits authentiques
            </h2>

            <p className="mt-5 text-base sm:text-lg text-cream/80 leading-relaxed max-w-xl">
              DEGLA valorise les trésors du désert de Kébili à travers des produits naturels, sains et gourmands.
            </p>

            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full bg-cream-50 text-forest hover:bg-white px-7 shadow-lg">
                <Link href="/a-propos" className="flex items-center gap-2">
                  En savoir plus <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Video Preview Button matching screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center"
          >
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="group flex items-center gap-4 text-left transition-transform hover:scale-105 focus-visible:outline-none"
            >
              <div className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-cream/90 text-forest shadow-lux backdrop-blur transition-all duration-300 group-hover:bg-gold group-hover:text-white">
                <Play className="size-6 fill-current pl-1" />
              </div>
              <span className="font-serif text-lg sm:text-xl font-medium text-cream group-hover:text-gold-light transition-colors">
                Découvrir notre histoire
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setVideoOpen(false)}
          >
            <div
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Fermer la vidéo"
                onClick={() => setVideoOpen(false)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="size-5" />
              </button>
              <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-cream">
                <Play className="size-16 text-gold opacity-80" />
                <h3 className="mt-4 font-serif text-2xl">La Palmeraie de Kébili</h3>
                <p className="mt-2 text-sm text-cream/70 max-w-md">
                  Vidéo immersive de la récolte au cœur du désert tunisien.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
