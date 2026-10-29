import { useId } from "react";
import { MATERIALS, VARIETY_PRESETS } from "@/components/three/presets";
import { DateGradientDefs, SoftShadow, SvgDate } from "./svg-date";

/** Illustrations d'états vides (viewBox 160 × 120). Couleurs : tokens CSS + matières partagées. */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 160 120" className="size-full" role="img" aria-label={label}>
      <circle cx={80} cy={64} r={50} fill="var(--brand-soft)" />
      {children}
    </svg>
  );
}

export function EmptyBasket() {
  const g = `eb-${useId().replace(/:/g, "")}`;
  return (
    <Frame label="Panier vide">
      <defs>
        <DateGradientDefs id={g} color={VARIETY_PRESETS["deglet-nour"].color} />
      </defs>
      <SoftShadow cx={80} cy={104} rx={44} ry={6} />
      <path d="M38 56 L122 56 L112 100 L48 100 Z" fill={MATERIALS.kraft} />
      <path d="M38 56 L122 56 L120 64 L40 64 Z" fill={MATERIALS.kraftDark} />
      <path d="M56 56 Q 80 18 104 56" fill="none" stroke={MATERIALS.kraftDark} strokeWidth={5} strokeLinecap="round" />
      <path d="M52 72 L108 72 M54 84 L106 84" stroke={MATERIALS.kraftLight} strokeWidth={2} />
      <SvgDate cx={124} cy={92} rx={7} ry={11} rot={60} gradientId={g} />
    </Frame>
  );
}

export function NoOrders() {
  return (
    <Frame label="Aucune commande">
      <SoftShadow cx={80} cy={102} rx={42} ry={6} />
      <path d="M44 50 L80 36 L116 50 L116 94 L80 108 L44 94 Z" fill={MATERIALS.kraft} />
      <path d="M44 50 L80 64 L116 50 L80 36 Z" fill={MATERIALS.kraftLight} />
      <path d="M80 64 L80 108" stroke={MATERIALS.kraftDark} strokeWidth={1.5} />
      <path d="M62 43 L98 57 L98 70" fill="none" stroke={MATERIALS.labelAccent} strokeWidth={4} />
    </Frame>
  );
}

export function NoResults() {
  const g = `nr-${useId().replace(/:/g, "")}`;
  return (
    <Frame label="Aucun résultat">
      <defs>
        <DateGradientDefs id={g} color={VARIETY_PRESETS.lemsi.color} />
      </defs>
      <SoftShadow cx={76} cy={104} rx={34} ry={5} />
      <SvgDate cx={66} cy={78} rx={11} ry={18} rot={-20} gradientId={g} />
      <circle cx={92} cy={56} r={22} fill="var(--card)" stroke="var(--date)" strokeWidth={5} />
      <path d="M108 72 L124 90" stroke="var(--date)" strokeWidth={7} strokeLinecap="round" />
      <path d="M84 52 Q 92 44 100 52" fill="none" stroke="var(--brand-fill)" strokeWidth={2.5} strokeLinecap="round" />
    </Frame>
  );
}

export function NoMessages() {
  return (
    <Frame label="Aucun message">
      <rect x={34} y={34} width={70} height={44} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <path d="M50 78 L46 92 L62 78 Z" fill="var(--card)" />
      <rect x={66} y={58} width={62} height={38} rx={13} fill="var(--date)" />
      <path d="M114 96 L120 106 L104 96 Z" fill="var(--date)" />
      <circle cx={84} cy={77} r={3} fill="var(--cream)" />
      <circle cx={97} cy={77} r={3} fill="var(--cream)" />
      <circle cx={110} cy={77} r={3} fill="var(--cream)" />
      <path d="M48 50 L88 50 M48 62 L76 62" stroke="var(--border)" strokeWidth={3} strokeLinecap="round" />
    </Frame>
  );
}

/** 404 : une datte seule et perdue dans la palmeraie. */
export function LostDate() {
  const g = `ld-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 240 160" className="size-full" role="img" aria-label="Une datte égarée">
      <defs>
        <DateGradientDefs id={g} color={VARIETY_PRESETS["deglet-nour"].color} />
      </defs>
      <path d="M0 128 Q 60 104 120 120 T 240 116 L240 160 L0 160 Z" fill="var(--brand-soft)" />
      <path d="M0 140 Q 80 124 160 138 T 240 136 L240 160 L0 160 Z" fill="var(--sand)" />
      <g stroke="var(--date)" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5}>
        <path d="M40 124 Q 44 80 38 50" />
        <path d="M38 50 q -20 -6 -32 6 M38 50 q 18 -12 34 -4 M38 50 q -10 -18 -26 -20 M38 50 q 8 -18 24 -22" />
        <path d="M200 120 Q 204 86 198 64" />
        <path d="M198 64 q -18 -4 -28 6 M198 64 q 16 -10 30 -2 M198 64 q -8 -16 -22 -18" />
      </g>
      <SoftShadow cx={124} cy={128} rx={16} ry={3.5} />
      <SvgDate cx={122} cy={106} rx={11} ry={19} rot={24} gradientId={g} />
      <path d="M140 76 q 6 -8 0 -14 q -6 -6 -1 -12" fill="none" stroke="var(--muted-foreground)" strokeWidth={2} strokeLinecap="round" strokeDasharray="2 5" />
      <text x={150} y={58} fontSize={16} fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-fraunces), serif" }}>?</text>
    </svg>
  );
}

/** Dossier en cours d'examen (onboarding vendeur). */
export function VerificationIllustration() {
  return (
    <Frame label="Dossier en cours d'examen">
      <SoftShadow cx={80} cy={104} rx={36} ry={5} />
      <rect x={50} y={26} width={60} height={76} rx={6} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <path d="M60 42 L100 42 M60 54 L96 54 M60 66 L88 66" stroke="var(--border)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={104} cy={86} r={18} fill="var(--success)" />
      <path d="M95 86 L101 92 L113 80" fill="none" stroke="var(--cream)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}
