import { MATERIALS, mulberry32, shade } from "@/components/three/presets";
import { SoftShadow, SvgDate, SvgLabel } from "./svg-date";

/** Arrangements de dattes pour ProductIllustration (viewBox 200 × 200). */

type ArrProps = { g: string; seed: number; wrinkles: number; gid: string };

export function VracBowl({ g, seed, wrinkles, gid }: ArrProps) {
  const rnd = mulberry32(seed);
  const pos: [number, number][] = [
    [68, 122], [90, 126], [112, 126], [134, 122],
    [79, 106], [101, 108], [123, 106],
    [90, 90], [112, 92],
  ];
  return (
    <g>
      <SoftShadow cx={100} cy={170} rx={62} ry={9} />
      <defs>
        <linearGradient id={`${gid}-bowl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MATERIALS.terracotta} />
          <stop offset="100%" stopColor={MATERIALS.terracottaDark} />
        </linearGradient>
      </defs>
      <ellipse cx={100} cy={128} rx={62} ry={14} fill={MATERIALS.terracottaDark} />
      {pos.map(([x, y], i) => (
        <SvgDate key={i} cx={x} cy={y} rx={12 + rnd() * 1.5} ry={20 + rnd() * 2} rot={-35 + rnd() * 70} gradientId={g} wrinkles={wrinkles} calyx={i > 3} />
      ))}
      <path d="M38 128 Q 42 168 100 168 Q 158 168 162 128 Q 140 142 100 142 Q 60 142 38 128 Z" fill={`url(#${gid}-bowl)`} />
      <path d="M44 134 Q 100 150 156 134" fill="none" stroke={shade(MATERIALS.terracotta, 0.35)} strokeWidth={1.4} opacity={0.6} />
    </g>
  );
}

export function Branchee({ g, seed, wrinkles }: ArrProps) {
  const rnd = mulberry32(seed);
  const strands = Array.from({ length: 9 }, (_, i) => {
    const x0 = 64 + i * 9;
    const len = 60 + rnd() * 30;
    const dx = (i - 4) * 5 + (rnd() - 0.5) * 6;
    return { x0, len, dx };
  });
  return (
    <g>
      <SoftShadow cx={102} cy={178} rx={48} ry={7} />
      <path d="M100 18 C 104 40, 96 52, 100 70" stroke={MATERIALS.stemDark} strokeWidth={6} fill="none" strokeLinecap="round" />
      {strands.map((s, i) => (
        <g key={i}>
          <path d={`M100 66 Q ${s.x0} 80 ${s.x0 + s.dx} ${70 + s.len}`} stroke={MATERIALS.stem} strokeWidth={1.6} fill="none" />
          {[0.45, 0.72, 1].map((t, j) => {
            const x = 100 + (s.x0 + s.dx - 100) * t + (rnd() - 0.5) * 4;
            const y = 66 + (s.len + 4) * t + 6;
            return <SvgDate key={j} cx={x} cy={y} rx={8.5} ry={14} rot={(s.dx + (rnd() - 0.5) * 20) * 0.8} gradientId={g} wrinkles={wrinkles} />;
          })}
        </g>
      ))}
    </g>
  );
}

export function Barquette({ g, seed, wrinkles }: ArrProps) {
  const rnd = mulberry32(seed);
  return (
    <g>
      <SoftShadow cx={100} cy={160} rx={74} ry={9} />
      <path d="M30 104 L170 104 L160 152 L40 152 Z" fill={MATERIALS.kraft} />
      <path d="M30 104 L170 104 L166 112 L34 112 Z" fill={MATERIALS.kraftLight} />
      {[0, 1].map((row) =>
        Array.from({ length: 5 }, (_, i) => (
          <SvgDate key={`${row}-${i}`} cx={50 + i * 25 + row * 4} cy={96 + row * 10} rx={11} ry={18} rot={78 + (rnd() - 0.5) * 16} gradientId={g} wrinkles={wrinkles} calyx={false} />
        )),
      )}
      <path d="M36 116 L164 116 L160 152 L40 152 Z" fill={MATERIALS.kraft} />
      <SvgLabel x={72} y={124} w={56} h={22} texte="Récolte 2026" />
    </g>
  );
}

export function GiftBox({ g, seed, wrinkles }: ArrProps) {
  const rnd = mulberry32(seed);
  return (
    <g>
      <SoftShadow cx={104} cy={166} rx={78} ry={9} />
      <rect x={112} y={44} width={70} height={78} rx={4} fill={MATERIALS.kraftDark} transform="rotate(12 147 83)" />
      <rect x={140} y={44} width={10} height={78} fill={MATERIALS.labelAccent} transform="rotate(12 147 83)" opacity={0.85} />
      <path d="M26 100 L150 100 L150 160 L26 160 Z" fill={MATERIALS.kraft} />
      <path d="M26 100 L150 100 L162 92 L38 92 Z" fill={MATERIALS.kraftLight} />
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <ellipse cx={46 + i * 28} cy={100} rx={12} ry={6} fill={shade(MATERIALS.kraft, -0.35)} />
          <SvgDate cx={46 + i * 28 + 4} cy={93} rx={10} ry={16} rot={70 + (rnd() - 0.5) * 20} gradientId={g} wrinkles={wrinkles} calyx={false} />
        </g>
      ))}
      <path d="M150 100 L162 92 L162 152 L150 160 Z" fill={MATERIALS.kraftDark} />
      <rect x={82} y={100} width={10} height={60} fill={MATERIALS.labelAccent} opacity={0.85} />
      <SvgLabel x={40} y={124} w={36} h={20} texte="Coffret" />
    </g>
  );
}

export function Sachet({ g, seed, wrinkles }: ArrProps) {
  const rnd = mulberry32(seed);
  return (
    <g>
      <SoftShadow cx={100} cy={172} rx={52} ry={8} />
      <path d="M58 52 L142 52 L150 168 L50 168 Z" fill={MATERIALS.kraft} />
      <path d="M58 52 L142 52 L144 66 L56 66 Z" fill={MATERIALS.kraftDark} />
      <path d="M56 60 L144 60" stroke={MATERIALS.kraftLight} strokeWidth={1.2} strokeDasharray="3 3" />
      <rect x={72} y={78} width={56} height={40} rx={18} fill={shade(MATERIALS.kraft, -0.25)} />
      {[0, 1, 2].map((i) => (
        <SvgDate key={i} cx={86 + i * 14} cy={98} rx={6.5} ry={11} rot={60 + (rnd() - 0.5) * 30} gradientId={g} wrinkles={wrinkles} calyx={false} />
      ))}
      <SvgLabel x={66} y={128} w={68} h={26} texte="200 g" />
    </g>
  );
}
