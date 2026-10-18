import { useId } from "react";
import { cn } from "@/lib/utils";
import { PRODUCT_TINTS, VARIETY_PRESETS, seedFrom } from "@/components/three/presets";
import type { Produit, VarieteSlug, VisuelProduit } from "@/types/domain";
import { Barquette, Branchee, GiftBox, Sachet, VracBowl } from "./date-arrangements";
import { Bocal, Bouteille } from "./glass-products";
import { DateGradientDefs } from "./svg-date";

export type ProductIllustrationProps = {
  type: VisuelProduit;
  variete?: VarieteSlug;
  /** Teinte du contenu pour bocal / bouteille. */
  teinte?: keyof typeof PRODUCT_TINTS;
  etiquette?: string;
  /** Graine de variation (ex. slug du produit) — rendu déterministe. */
  seed?: string;
  /** Variante de cadrage (galerie : 0 à 3). */
  variante?: number;
  className?: string;
  title?: string;
};

const CADRAGES = [
  "translate(0 0) scale(1)",
  "translate(-30 -26) scale(1.3)",
  "translate(14 6) scale(0.86) rotate(-6 100 100)",
  "translate(-62 -70) scale(1.62)",
];

/**
 * Illustration SVG procédurale d'un produit (aucune photo).
 * La couleur des dattes vient de `presets.ts` (même source que la 3D).
 */
export function ProductIllustration({ type, variete = "deglet-nour", teinte, etiquette, seed = "degla", variante = 0, className, title }: ProductIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const gid = `pi-${uid}`;
  const dateG = `${gid}-date`;
  const preset = VARIETY_PRESETS[variete];
  const s = seedFrom(seed + variante);
  const wrinkles = Math.min(1, preset.shape.wrinkle * 18);
  const tint = PRODUCT_TINTS[teinte ?? (type === "bouteille" ? "jus" : "confiture")];
  const props = { g: dateG, seed: s, wrinkles, gid };

  return (
    <svg viewBox="0 0 200 200" className={cn("size-full", className)} role="img" aria-label={title ?? `Illustration : ${preset.nom}`}>
      <defs>
        <DateGradientDefs id={dateG} color={preset.color} />
      </defs>
      <circle cx={100} cy={104} r={74} fill="var(--brand-soft)" opacity={0.75} />
      <circle cx={100} cy={104} r={54} fill="var(--card)" opacity={0.35} />
      <g transform={CADRAGES[variante % CADRAGES.length]}>
        {type === "vrac" && <VracBowl {...props} />}
        {type === "branchee" && <Branchee {...props} />}
        {type === "barquette" && <Barquette {...props} />}
        {type === "boite" && <GiftBox {...props} />}
        {type === "sachet" && <Sachet {...props} />}
        {type === "bocal" && <Bocal tint={tint} gid={gid} etiquette={etiquette ?? "Confiture"} />}
        {type === "bouteille" && <Bouteille tint={tint} gid={gid} etiquette={etiquette ?? "Jus de datte"} />}
      </g>
    </svg>
  );
}

/** Illustration d'un produit du domaine (déduit type, variété, teinte et étiquette). */
export function ProduitVisuel({ produit, variante, className }: { produit: Produit; variante?: number; className?: string }) {
  const derive = produit.typeProduit === "DERIVE";
  return (
    <ProductIllustration
      type={produit.visuel.type}
      variete={produit.variete}
      teinte={derive ? teintePourDerive(produit.typeDerive) : undefined}
      etiquette={derive ? produit.nom.split(" ").slice(0, 2).join(" ") : undefined}
      seed={produit.slug}
      variante={variante}
      className={className}
      title={produit.nom}
    />
  );
}

/** Teinte de contenu déduite d'un type de dérivé. */
export function teintePourDerive(typeDerive?: string): keyof typeof PRODUCT_TINTS | undefined {
  switch (typeDerive) {
    case "JUS":
      return "jus";
    case "CONFITURE":
      return "confiture";
    case "PATE":
      return "pate";
    case "ROB":
      return "rob";
    case "MIEL":
      return "miel";
    case "CAFE_NOYAUX":
      return "cafe";
    default:
      return undefined;
  }
}
