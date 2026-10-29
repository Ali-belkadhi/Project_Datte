import { MATERIALS, shade } from "@/components/three/presets";

/**
 * Primitives SVG partagées : une datte = ellipse + dégradé radial (clair en haut à gauche,
 * foncé en bas à droite) + reflet + calice.
 */

export function DateGradientDefs({ id, color }: { id: string; color: string }) {
  return (
    <radialGradient id={id} cx="32%" cy="28%" r="85%">
      <stop offset="0%" stopColor={shade(color, 0.42)} />
      <stop offset="45%" stopColor={color} />
      <stop offset="100%" stopColor={shade(color, -0.55)} />
    </radialGradient>
  );
}

type SvgDateProps = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot?: number;
  gradientId: string;
  calyx?: boolean;
  wrinkles?: number; // 0..1
};

export function SvgDate({ cx, cy, rx, ry, rot = 0, gradientId, calyx = true, wrinkles = 0 }: SvgDateProps) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${gradientId})`} />
      {wrinkles > 0 && (
        <g fill="none" stroke={MATERIALS.shadow} strokeOpacity={0.18 * wrinkles} strokeWidth={0.8} strokeLinecap="round">
          <path d={`M${cx - rx * 0.35} ${cy - ry * 0.55} q ${rx * 0.2} ${ry * 0.55} 0 ${ry * 1.1}`} />
          <path d={`M${cx + rx * 0.25} ${cy - ry * 0.4} q ${-rx * 0.18} ${ry * 0.5} ${rx * 0.05} ${ry * 0.9}`} />
        </g>
      )}
      <ellipse cx={cx - rx * 0.38} cy={cy - ry * 0.32} rx={rx * 0.2} ry={ry * 0.32} fill={MATERIALS.highlight} opacity={0.5} />
      {calyx && (
        <path
          d={`M${cx - rx * 0.42} ${cy - ry * 0.9} q ${rx * 0.42} ${-ry * 0.32} ${rx * 0.84} 0 q ${-rx * 0.42} ${ry * 0.14} ${-rx * 0.84} 0 Z`}
          fill={MATERIALS.calyx}
        />
      )}
    </g>
  );
}

/** Ombre portée douce sous un objet. */
export function SoftShadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={MATERIALS.shadow} opacity={0.14} />;
}

/** Étiquette « DEGLA » (fond crème, nom en Fraunces). */
export function SvgLabel({ x, y, w, h, texte, sous }: { x: number; y: number; w: number; h: number; texte: string; sous?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={MATERIALS.label} />
      <rect x={x} y={y + 3} width={w} height={1.2} fill={MATERIALS.labelAccent} opacity={0.8} />
      <text
        x={x + w / 2}
        y={y + h * 0.52}
        textAnchor="middle"
        fontSize={Math.min(11, w / 5.2)}
        fontWeight={700}
        fill={MATERIALS.labelInk}
        style={{ fontFamily: "var(--font-fraunces), serif", letterSpacing: "0.04em" }}
      >
        DEGLA
      </text>
      <text
        x={x + w / 2}
        y={y + h * 0.82}
        textAnchor="middle"
        fontSize={Math.min(6.5, w / 9)}
        fill={MATERIALS.labelInk}
        opacity={0.75}
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {texte}
        {sous ? ` · ${sous}` : ""}
      </text>
    </g>
  );
}
