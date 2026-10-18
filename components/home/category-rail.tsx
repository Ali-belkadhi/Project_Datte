"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/products";
import { motion } from "motion/react";

export function CategoryRail() {
  return (
    <section className="relative w-full py-12 lg:py-16 bg-cream/50 border-y border-forest/5">
      <div className="container-lux">
        {/* Horizontal scroll on mobile, flex grid on desktop */}
        <div className="flex items-start justify-between gap-4 overflow-x-auto no-scrollbar pb-4 pt-2 sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex min-w-[130px] flex-col items-center text-center group"
            >
              <Link
                href={`/produits?categorie=${cat.slug}`}
                className="flex flex-col items-center focus-visible:outline-none"
              >
                {/* Circular image with warm desert pedestal shadow */}
                <div className="relative size-24 sm:size-28 md:size-28 lg:size-32 rounded-full overflow-hidden bg-sand/60 border border-forest/10 p-2 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:border-gold">
                  <div className="relative h-full w-full rounded-full overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 120px, 140px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Name + Arrow */}
                <div className="mt-3.5 flex items-center justify-center gap-1.5">
                  <span className="font-serif text-sm md:text-base font-medium text-forest group-hover:text-gold-dark transition-colors leading-tight">
                    {cat.label[0]}
                    <br />
                    {cat.label[1]}
                  </span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-cream transition-transform duration-300 group-hover:bg-gold group-hover:translate-x-0.5">
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
