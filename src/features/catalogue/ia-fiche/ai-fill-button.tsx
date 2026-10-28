"use client";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bouton « Remplir avec l'IA » (style brand, étincelle) avec état « Analyse des photos… » + shimmer. */
export function AiFillButton({ etat, onClick, disabled }: { etat: "inactif" | "analyse" | "flux" | "termine"; onClick: () => void; disabled?: boolean }) {
  const occupe = etat === "analyse" || etat === "flux";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || occupe}
      className={cn(
        "relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand px-5 font-semibold text-brand-foreground shadow-soft transition-all hover:bg-brand/90 disabled:cursor-not-allowed sm:w-auto",
        occupe && "bg-brand/90",
      )}
    >
      {occupe && <span aria-hidden className="bg-shimmer animate-shimmer absolute inset-0" />}
      {occupe ? <Loader2 className="relative size-4 animate-spin" aria-hidden /> : <Sparkles className="relative size-4" aria-hidden />}
      <span className="relative">{etat === "analyse" ? "Analyse des photos…" : etat === "flux" ? "Rédaction de la fiche…" : etat === "termine" ? "Relancer l'IA" : "Remplir avec l'IA"}</span>
    </button>
  );
}

/** Badge « Suggéré par l'IA » posé sur un champ rempli par l'IA (disparaît à la modification). */
export function AiSuggestedField({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {visible && (
        <span className="pointer-events-none absolute -top-2.5 end-3 inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground uppercase ring-2 ring-card">
          <Sparkles className="size-2.5" aria-hidden /> Suggéré par l&apos;IA
        </span>
      )}
    </div>
  );
}
