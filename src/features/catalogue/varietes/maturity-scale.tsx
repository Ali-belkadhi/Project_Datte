import { useId } from "react";
import { DateGradientDefs, SvgDate } from "@/components/illustrations/svg-date";
import { VARIETY_PRESETS, shade } from "@/components/three/presets";
import type { VarieteSlug } from "@/types/domain";

const STADES = [
  { cle: "BSER", nom: "Bser", detail: "Fraîche et croquante", texte: "Cueillie jaune ou rouge, juteuse, légèrement astringente.", teinte: 0.45 },
  { cle: "RTOB", nom: "Rtob", detail: "Semi-molle", texte: "La pointe s'assombrit et s'attendrit : sucrée et fondante.", teinte: 0.1 },
  { cle: "TAMR", nom: "Tamr", detail: "Mûre", texte: "Entièrement mûre, concentrée en sucres, de longue conservation.", teinte: -0.15 },
] as const;

/** Échelle visuelle de maturité Bser → Rtob → Tamr. */
export function MaturityScale({ variete }: { variete: VarieteSlug }) {
  const id = useId().replace(/:/g, "");
  const base = VARIETY_PRESETS[variete].color;
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {STADES.map((s, i) => (
        <li key={s.cle} className="relative flex items-center gap-4 rounded-2xl border bg-card p-4 sm:flex-col sm:text-center">
          <svg viewBox="0 0 40 56" className="h-16 w-12 shrink-0" aria-hidden>
            <defs>
              <DateGradientDefs id={`ms-${id}-${i}`} color={s.cle === "BSER" ? VARIETY_PRESETS.bessr.color : shade(base, s.teinte)} />
            </defs>
            <SvgDate cx={20} cy={30} rx={12 - i} ry={20 - i} gradientId={`ms-${id}-${i}`} wrinkles={i * 0.6} />
          </svg>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">Stade {i + 1}</p>
            <p className="font-display text-xl font-semibold">{s.nom}</p>
            <p className="text-sm font-medium">{s.detail}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{s.texte}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
