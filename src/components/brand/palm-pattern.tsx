import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Motif de palmes en filigrane (traits fins, opacité 6 à 10 %).
 * Utilisé en fond de hero, de pied de page et de bannières. Couleur : `currentColor`.
 */
export function PalmPattern({ className, opacity = 0.08 }: { className?: string; opacity?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} style={{ opacity }}>
      <defs>
        <pattern id={`palm-${id}`} width="180" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
            <PalmFrond x={30} y={150} angle={-55} />
            <PalmFrond x={120} y={90} angle={-25} />
            <PalmFrond x={160} y={175} angle={-70} scale={0.7} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#palm-${id})`} />
    </svg>
  );
}

/** Une palme : nervure courbe + folioles de part et d'autre. */
export function PalmFrond({ x, y, angle, scale = 1 }: { x: number; y: number; angle: number; scale?: number }) {
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const px = t * 100;
    const py = -Math.sin(t * Math.PI * 0.9) * 22;
    const len = 26 * (1 - t * 0.55);
    return (
      <g key={i}>
        <path d={`M${px} ${py} q ${len * 0.3} ${-len * 0.6} ${len * 0.15} ${-len}`} />
        <path d={`M${px} ${py} q ${len * 0.5} ${len * 0.35} ${len * 0.9} ${len * 0.55}`} />
      </g>
    );
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d="M0 0 Q 50 -30 100 -10" />
      {leaves}
    </g>
  );
}
