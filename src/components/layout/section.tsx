import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  surtitre?: string;
  titre?: string;
  description?: string;
  lien?: { href: string; label: string };
  tone?: "default" | "sand" | "night";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
};

/** Section de page : conteneur max-w-7xl, rythme vertical py-12 / py-20, aplat sable ou nuit optionnel. */
export function Section({ id, surtitre, titre, description, lien, tone = "default", className, innerClassName, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative py-12 md:py-20",
        tone === "sand" && "bg-sand",
        tone === "night" && "bg-hero text-cream",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-7xl px-4 md:px-6", innerClassName)}>
        {(titre || surtitre) && (
          <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              {surtitre && (
                <p className={cn("text-[11px] font-semibold tracking-[0.16em] uppercase", tone === "night" ? "text-brand-light" : "text-brand")}>
                  {surtitre}
                </p>
              )}
              {titre && <h2 className="font-display text-2xl font-semibold text-balance md:text-3xl">{titre}</h2>}
              {description && <p className={cn("max-w-2xl", tone === "night" ? "text-cream/75" : "text-muted-foreground")}>{description}</p>}
            </div>
            {lien && (
              <Link
                href={lien.href}
                className={cn(
                  "group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold",
                  tone === "night" ? "text-brand-light" : "text-date",
                )}
              >
                {lien.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Conteneur de page standard (marges latérales + largeur max). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>{children}</div>;
}
