import Link from "next/link";
import { cn } from "@/lib/utils";
import { Monogram } from "./monogram";

type LogoProps = {
  variant?: "full" | "mark" | "mono";
  tone?: "light" | "dark";
  href?: string | null;
  className?: string;
  suffix?: React.ReactNode;
};

/**
 * Logo DEGLA : monogramme + mot-symbole « DEGLA » en Fraunces 700 avec un point final ambre.
 * `tone="light"` pour les fonds sombres (night).
 */
export function Logo({ variant = "full", tone = "dark", href = "/", className, suffix }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Monogram mono={variant === "mono"} className={cn("size-7 shrink-0", variant === "mono" && (tone === "light" ? "text-cream" : "text-foreground"))} />
      {variant !== "mark" && (
        <span
          className={cn(
            "font-display text-[22px] leading-none font-bold tracking-tight",
            tone === "light" ? "text-cream" : "text-foreground",
          )}
        >
          DEGLA<span className={variant === "mono" ? "" : "text-brand-fill"}>.</span>
        </span>
      )}
      {suffix}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="DEGLA — accueil" className="rounded-lg focus-visible:outline-offset-4">
      {content}
    </Link>
  );
}
