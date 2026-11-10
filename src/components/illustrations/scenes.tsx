import { useId } from "react";
import { cn } from "@/lib/utils";
import { MATERIALS, VARIETY_PRESETS } from "@/components/three/presets";
import type { TypeDocument } from "@/types/enums";
import { DateGradientDefs, SvgDate } from "./svg-date";

/** Scène d'oasis (palmiers, dunes) — panneaux d'onboarding, bannières. */
export function OasisScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 180" className={cn("size-full", className)} aria-hidden preserveAspectRatio="xMidYMax slice">
      <circle cx={300} cy={60} r={28} fill="var(--brand-light)" opacity={0.5} />
      <path d="M0 140 Q 100 110 200 130 T 400 120 L400 180 L0 180 Z" fill="var(--brand-fill)" opacity={0.25} />
      <path d="M0 156 Q 120 136 240 150 T 400 146 L400 180 L0 180 Z" fill="var(--date)" opacity={0.35} />
      {[60, 110, 330].map((x, i) => (
        <g key={x} transform={`translate(${x} ${150 - i * 4}) scale(${1 - i * 0.12})`} stroke="var(--date)" fill="none" strokeLinecap="round" opacity={0.8}>
          <path d="M0 0 Q 4 -40 -2 -78" strokeWidth={4} />
          <path d="M-2 -78 q -24 -6 -38 8 M-2 -78 q 22 -14 40 -4 M-2 -78 q -12 -22 -32 -24 M-2 -78 q 10 -22 30 -26 M-2 -78 q 2 -20 -4 -32" strokeWidth={2.5} />
        </g>
      ))}
    </svg>
  );
}

/** Document factice (CIN, RNE, patente…) pour la visionneuse admin. */
export function DocumentIllustration({ type, nom }: { type: TypeDocument; nom: string }) {
  const carte = type === "CIN";
  return (
    <svg viewBox="0 0 320 220" className="size-full" role="img" aria-label={`Document : ${type}`}>
      <rect x={0} y={0} width={320} height={220} fill="var(--sand)" />
      <g transform={carte ? "translate(40 40)" : "translate(70 14)"}>
        <rect width={carte ? 240 : 180} height={carte ? 150 : 196} rx={carte ? 12 : 4} fill={MATERIALS.label} stroke={MATERIALS.kraftDark} strokeOpacity={0.4} />
        <rect width={carte ? 240 : 180} height={carte ? 26 : 22} rx={carte ? 12 : 4} fill={carte ? MATERIALS.terracotta : MATERIALS.kraftDark} opacity={0.85} />
        <text x={12} y={carte ? 18 : 15} fontSize={10} fontWeight={700} fill={MATERIALS.label} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {carte ? "RÉPUBLIQUE TUNISIENNE · CIN" : type === "RNE" ? "REGISTRE NATIONAL DES ENTREPRISES" : type === "PATENTE" ? "PATENTE — RECETTE DES FINANCES" : "ATTESTATION"}
        </text>
        {carte ? (
          <>
            <rect x={14} y={40} width={56} height={70} rx={6} fill={MATERIALS.kraftLight} />
            <circle cx={42} cy={64} r={12} fill={MATERIALS.kraftDark} opacity={0.6} />
            <path d="M24 102 Q 42 80 60 102 Z" fill={MATERIALS.kraftDark} opacity={0.6} />
            <text x={84} y={54} fontSize={11} fontWeight={700} fill={MATERIALS.labelInk} style={{ fontFamily: "var(--font-inter), sans-serif" }}>{nom}</text>
            {[70, 84, 98, 112].map((y) => (
              <rect key={y} x={84} y={y} width={y === 112 ? 70 : 130} height={6} rx={3} fill={MATERIALS.labelInk} opacity={0.15} />
            ))}
          </>
        ) : (
          <>
            <text x={12} y={44} fontSize={10} fontWeight={700} fill={MATERIALS.labelInk} style={{ fontFamily: "var(--font-inter), sans-serif" }}>{nom}</text>
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={12} y={56 + i * 13} width={i % 3 === 2 ? 100 : 156} height={5} rx={2.5} fill={MATERIALS.labelInk} opacity={0.14} />
            ))}
            <circle cx={140} cy={170} r={18} fill="none" stroke={MATERIALS.terracotta} strokeWidth={2} opacity={type === "PATENTE" ? 0.25 : 0.7} />
          </>
        )}
      </g>
    </svg>
  );
}

/** Pictos « Comment ça marche » : 1 choisir, 2 commander chez plusieurs vendeurs, 3 recevoir et noter. */
export function StepIllustration({ etape }: { etape: 1 | 2 | 3 }) {
  const g = `st-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 120 90" className="size-full" aria-hidden>
      <defs>
        <DateGradientDefs id={g} color={VARIETY_PRESETS["deglet-nour"].color} />
      </defs>
      <circle cx={60} cy={46} r={38} fill="var(--brand-soft)" />
      {etape === 1 && (
        <>
          <SvgDate cx={50} cy={50} rx={10} ry={17} rot={-18} gradientId={g} />
          <SvgDate cx={70} cy={48} rx={10} ry={17} rot={14} gradientId={g} />
          <circle cx={82} cy={30} r={11} fill="var(--card)" stroke="var(--date)" strokeWidth={3} />
          <path d="M90 38 L98 46" stroke="var(--date)" strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {etape === 2 && (
        <>
          <rect x={30} y={40} width={28} height={28} rx={4} fill={MATERIALS.kraft} />
          <rect x={62} y={34} width={30} height={34} rx={4} fill={MATERIALS.kraftDark} />
          <path d="M44 40 L44 68 M77 34 L77 68" stroke={MATERIALS.labelAccent} strokeWidth={3} />
          <path d="M36 28 Q 60 10 84 26" fill="none" stroke="var(--date)" strokeWidth={2} strokeDasharray="3 4" />
        </>
      )}
      {etape === 3 && (
        <>
          <rect x={36} y={36} width={48} height={34} rx={5} fill={MATERIALS.kraft} />
          <path d="M36 36 L60 50 L84 36" fill="none" stroke={MATERIALS.kraftDark} strokeWidth={2} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} transform={`translate(${34 + i * 12} 16) scale(0.5)`} d="M10 0 L13 7 L20 7 L14 12 L16 20 L10 15 L4 20 L6 12 L0 7 L7 7 Z" fill="var(--brand-fill)" />
          ))}
        </>
      )}
    </svg>
  );
}
