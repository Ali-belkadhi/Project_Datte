"use client";
import { startTransition } from "react";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useMounted } from "@/hooks/use-mounted";
import { basculerFavori } from "@/server/modules/catalogue/actions";

/** Cœur favori : mise à jour optimiste, puis confirmation ou restauration selon MongoDB. */
export function FavoriteButton({ produitId, nom, className, size = "md" }: { produitId: string; nom: string; className?: string; size?: "md" | "lg" }) {
  const actif = useFavoritesStore((s) => s.ids.includes(produitId));
  const basculer = useFavoritesStore((s) => s.basculer);
  const definir = useFavoritesStore((s) => s.definir);
  const commencer = useFavoritesStore((s) => s.commencer);
  const terminer = useFavoritesStore((s) => s.terminer);
  const pending = useFavoritesStore((s) => s.enCours.includes(produitId));
  const mounted = useMounted();
  const reduit = useReducedMotion();
  const on = mounted && actif;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-busy={pending}
      disabled={pending}
      aria-label={on ? `Retirer « ${nom} » des favoris` : `Ajouter « ${nom} » aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        if (!commencer(produitId)) return;
        const ajoute = basculer(produitId);
        startTransition(async () => {
          try {
            const resultat = await basculerFavori({ produitId });
            if (!resultat.ok) {
              definir(produitId, !ajoute);
              toast.error(resultat.error.message);
              return;
            }
            definir(produitId, resultat.data.ajoute);
            toast(resultat.data.ajoute ? "Ajouté à vos favoris" : "Retiré de vos favoris", { description: nom });
          } catch {
            definir(produitId, !ajoute);
            toast.error("Impossible de mettre à jour vos favoris. Réessayez.");
          } finally {
            terminer(produitId);
          }
        });
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
