"use client";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useMounted } from "@/hooks/use-mounted";
import { basculerFavori } from "@/server/modules/catalogue/actions";

/** Cœur favori (store de démo + Server Action basculerFavori). */
export function FavoriteButton({ produitId, nom, className, size = "md" }: { produitId: string; nom: string; className?: string; size?: "md" | "lg" }) {
  const actif = useFavoritesStore((s) => s.ids.includes(produitId));
  const basculer = useFavoritesStore((s) => s.basculer);
  const mounted = useMounted();
  const reduit = useReducedMotion();
  const on = mounted && actif;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Retirer « ${nom} » des favoris` : `Ajouter « ${nom} » aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        const ajoute = basculer(produitId);
        toast(ajoute ? "Ajouté à vos favoris" : "Retiré de vos favoris", { description: nom });
        void basculerFavori({ produitId });
      }}
      className={cn(
        "relative z-10 grid place-items-center rounded-full border border-border/60 bg-card/90 backdrop-blur transition-colors hover:bg-card",
        size === "lg" ? "size-12" : "size-10",
        className,
      )}
    >
      <motion.span key={String(on)} initial={reduit ? false : { scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        <Heart className={cn("size-[18px]", on ? "fill-danger text-danger" : "text-foreground")} />
      </motion.span>
    </button>
  );
}
