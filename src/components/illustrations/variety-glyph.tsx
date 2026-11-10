import { useId } from "react";
import { cn } from "@/lib/utils";
import { VARIETY_PRESETS } from "@/components/three/presets";
import type { VarieteSlug } from "@/types/domain";
import { DateGradientDefs, SvgDate } from "./svg-date";

/** Une datte unique, à la forme et à la couleur de la variété (puces, filtres, sélecteurs). */
export function VarietyGlyph({ variete, className, title }: { variete: VarieteSlug; className?: string; title?: string }) {
  const id = `vg-${useId().replace(/:/g, "")}`;
  const p = VARIETY_PRESETS[variete];
  // proportions issues de la forme 3D : length / radius
  const ry = 13 * (p.shape.length / 0.62);
  const rx = 13 * (p.shape.radius / 0.25) * 0.62;
  return (
    <svg viewBox="0 0 32 32" className={cn("size-6 shrink-0", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <DateGradientDefs id={id} color={p.color} />
      </defs>
      <SvgDate cx={16} cy={17} rx={Math.min(rx, 10)} ry={Math.min(ry, 14)} rot={18} gradientId={id} wrinkles={Math.min(1, p.shape.wrinkle * 18)} />
    </svg>
  );
}
