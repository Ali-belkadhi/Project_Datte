import { MATERIALS, shade } from "@/components/three/presets";
import { SoftShadow, SvgLabel } from "./svg-date";

/** Bocal et bouteille en verre (viewBox 200 × 200). */

export function Bocal({ tint, gid, etiquette }: { tint: string; gid: string; etiquette: string }) {
  return (
    <g>
      <SoftShadow cx={100} cy={172} rx={50} ry={8} />
      <defs>
        <linearGradient id={`${gid}-glass`} x1="0" x2="1">
          <stop offset="0%" stopColor={MATERIALS.glass} stopOpacity={0.55} />
          <stop offset="30%" stopColor={MATERIALS.glass} stopOpacity={0.12} />
          <stop offset="80%" stopColor={MATERIALS.glass} stopOpacity={0.05} />
          <stop offset="100%" stopColor={MATERIALS.glass} stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id={`${gid}-fill`} x1="0" x2="1">
          <stop offset="0%" stopColor={shade(tint, 0.15)} />
          <stop offset="60%" stopColor={tint} />
          <stop offset="100%" stopColor={shade(tint, -0.4)} />
        </linearGradient>
      </defs>
      <rect x={58} y={64} width={84} height={104} rx={16} fill={`url(#${gid}-fill)`} />
      <rect x={54} y={56} width={92} height={114} rx={18} fill={`url(#${gid}-glass)`} stroke={MATERIALS.glass} strokeOpacity={0.6} strokeWidth={1.5} />
      <rect x={60} y={40} width={80} height={20} rx={5} fill={MATERIALS.metal} />
      <rect x={60} y={40} width={80} height={6} rx={3} fill={shade(MATERIALS.metal, 0.35)} />
      <SvgLabel x={62} y={98} w={76} h={34} texte={etiquette} />
      <rect x={64} y={66} width={7} height={92} rx={3.5} fill={MATERIALS.glass} opacity={0.35} />
    </g>
  );
}

export function Bouteille({ tint, gid, etiquette }: { tint: string; gid: string; etiquette: string }) {
  return (
    <g>
      <SoftShadow cx={100} cy={176} rx={36} ry={7} />
      <defs>
        <linearGradient id={`${gid}-liq`} x1="0" x2="1">
          <stop offset="0%" stopColor={shade(tint, 0.25)} stopOpacity={0.9} />
          <stop offset="55%" stopColor={tint} stopOpacity={0.92} />
          <stop offset="100%" stopColor={shade(tint, -0.45)} />
        </linearGradient>
      </defs>
      <path d="M88 22 L112 22 L112 50 Q 134 62 134 88 L134 162 Q 134 174 122 174 L78 174 Q 66 174 66 162 L66 88 Q 66 62 88 50 Z" fill={MATERIALS.glass} fillOpacity={0.2} stroke={MATERIALS.glass} strokeOpacity={0.7} strokeWidth={1.5} />
      <path d="M70 92 Q 70 70 92 60 L108 60 Q 130 70 130 92 L130 160 Q 130 170 120 170 L80 170 Q 70 170 70 160 Z" fill={`url(#${gid}-liq)`} />
      <rect x={86} y={12} width={28} height={14} rx={3} fill={MATERIALS.kraftDark} />
      <SvgLabel x={72} y={108} w={56} h={36} texte={etiquette} />
      <rect x={74} y={72} width={6} height={90} rx={3} fill={MATERIALS.glass} opacity={0.4} />
    </g>
  );
}
