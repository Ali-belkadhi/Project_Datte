import { cn } from "@/lib/utils";

/** Mini courbe SVG (sans librairie), couleur = currentColor. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 80;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("overflow-visible", className)} aria-hidden preserveAspectRatio="none">
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="currentColor" opacity="0.1" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
