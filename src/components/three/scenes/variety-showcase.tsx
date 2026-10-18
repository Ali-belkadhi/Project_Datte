"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Variete } from "@/types/domain";
import type { VarieteSlug } from "@/types/model-source";
import { VarietyGlyph } from "@/components/illustrations/variety-glyph";
import { cn } from "@/lib/utils";
import { LazyScene } from "../canvas/lazy-scene";
import { VARIETY_ORDER } from "../presets";
import { LazyDateLineup, LazySingleDate } from "./lazy";

function FicheVariete({ v }: { v: Variete }) {
  return (
    <motion.div
      key={v.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div>
        <p className="w-fit font-display text-sm text-muted-foreground" lang="ar" dir="rtl">
          {v.nomArabe}
        </p>
        <h3 className="font-display text-3xl font-semibold">{v.nom}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden /> {v.origine}
        </p>
      </div>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{v.resume}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["Goût", v.saveur],
          ["Texture", v.texture],
          ["Couleur", v.couleur],
          ["Saison", v.saison],
        ].map(([k, val]) => (
          <div key={k} className="rounded-xl bg-sand p-3">
            <dt className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{k}</dt>
            <dd className="mt-0.5 font-medium">{val}</dd>
          </div>
        ))}
      </dl>
      <Link href={`/variete/${v.slug}`} className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-date">
        Découvrir la {v.nom}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
      </Link>
    </motion.div>
  );
}

/**
 * Vitrine des variétés : les 8 dattes sur un socle ; au clic ou au survol, la datte s'avance et pivote
 * et sa fiche s'affiche à côté. Sur mobile : carrousel, une datte à la fois.
 */
export function VarietyShowcase({ varietes }: { varietes: Variete[] }) {
  const [sel, setSel] = useState<VarieteSlug>("deglet-nour");
  const ordre = VARIETY_ORDER.filter((s) => varietes.some((v) => v.slug === s));
  const courante = varietes.find((v) => v.slug === sel) ?? varietes[0];
  const idx = ordre.indexOf(sel);
  const decaler = (d: number) => setSel(ordre[(idx + d + ordre.length) % ordre.length]);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Desktop : socle complet */}
      <div className="hidden lg:block">
        <LazyScene className="aspect-[16/8] overflow-hidden rounded-3xl border bg-card" fallback={null}>
          <LazyDateLineup selection={sel} onSelect={setSel} />
        </LazyScene>
        <div role="tablist" aria-label="Choisir une variété" className="mt-4 flex flex-wrap justify-center gap-2">
          {ordre.map((s) => {
            const v = varietes.find((x) => x.slug === s)!;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={s === sel}
                onClick={() => setSel(s)}
                onMouseEnter={() => setSel(s)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                  s === sel ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                )}
              >
                <VarietyGlyph variete={s} className="size-4" />
                {v.nom}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile : carrousel */}
      <div className="lg:hidden">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-hero">
          <LazyScene className="absolute inset-0" fallback={<div className="grid size-full place-items-center"><VarietyGlyph variete={sel} className="size-32" /></div>}>
            <LazySingleDate key={sel} variete={sel} />
          </LazyScene>
          <button type="button" onClick={() => decaler(-1)} className="absolute start-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur" aria-label="Variété précédente">
            <ChevronLeft className="size-5 rtl:rotate-180" />
          </button>
          <button type="button" onClick={() => decaler(1)} className="absolute end-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur" aria-label="Variété suivante">
            <ChevronRight className="size-5 rtl:rotate-180" />
          </button>
          <p className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-night/60 px-3 py-1 text-[12px] font-semibold text-cream tabular-nums">
            {idx + 1} / {ordre.length}
          </p>
        </div>
      </div>

      <div className="min-h-[340px]">
        <AnimatePresence mode="wait">{courante && <FicheVariete v={courante} />}</AnimatePresence>
      </div>
    </div>
  );
}
