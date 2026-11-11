import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Monogramme DEGLA : une datte stylisée (ellipse verticale, dégradé ambre → brun,
 * reflet clair, calice en haut). Les couleurs viennent des tokens CSS.
 */
export function Monogram({ className, mono = false, title }: { className?: string; mono?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 40" className={cn("size-8", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={`dg-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--brand-light)" />
          <stop offset="55%" stopColor="var(--brand-fill)" />
          <stop offset="100%" stopColor="var(--date)" />
        </radialGradient>
      </defs>
      <path
        d="M16 6.5c6.6 0 10.5 6.8 10.5 15.6S22.4 37.5 16 37.5 5.5 31 5.5 22.1 9.4 6.5 16 6.5Z"
        fill={mono ? "currentColor" : `url(#dg-${id})`}
      />
      {!mono && <ellipse cx="11.6" cy="16.5" rx="2.2" ry="5.2" fill="var(--cream)" opacity="0.55" transform="rotate(-12 11.6 16.5)" />}
      <path
        d="M11.5 7.8c1.2-2.6 3-3.9 4.5-3.9s3.3 1.3 4.5 3.9c-1.4.7-2.9 1-4.5 1s-3.1-.3-4.5-1Z"
        fill={mono ? "currentColor" : "var(--brand-light)"}
        opacity={mono ? 0.7 : 1}
      />
      <path d="M16 4V1.5" stroke={mono ? "currentColor" : "var(--date)"} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
