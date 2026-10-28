"use client";
/**
 * DevViewSwitcher — pilule flottante « Démo » pour passer d'une vue à l'autre.
 * À SUPPRIMER quand l'authentification sera branchée (module A) :
 * la vue dépendra alors du rôle de l'utilisateur connecté.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Palette, ShieldCheck, ShoppingBasket, Store, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useViewStore } from "@/stores/view-store";

const VUES = [
  { href: "/", label: "Vue acheteur", icon: ShoppingBasket, zone: "acheteur" },
  { href: "/vendeur", label: "Vue vendeur", icon: Store, zone: "vendeur" },
  { href: "/admin", label: "Admin", icon: ShieldCheck, zone: "admin" },
  { href: "/design", label: "Design", icon: Palette, zone: "acheteur" },
] as const;

/** Mémorise la vue choisie (lue par getSession() côté serveur en l'absence d'en-tête). */
function memoriserVue(zone: string) {
  document.cookie = `degla-demo-view=${zone}; path=/; max-age=31536000; samesite=lax`;
}

function zoneActive(pathname: string) {
  if (pathname.startsWith("/vendeur")) return "/vendeur";
  if (pathname.startsWith("/admin")) return "/admin";
  if (pathname.startsWith("/design")) return "/design";
  return "/";
}

export function DevViewSwitcher() {
  const pathname = usePathname();
  const { ouvert, basculer, fermer } = useViewStore();
  const actif = zoneActive(pathname);

  const choisir = (zone: string) => {
    memoriserVue(zone);
    fermer();
  };

  return (
    <div className="fixed start-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[60] lg:start-5 lg:bottom-5 print:hidden">
      <AnimatePresence>
        {ouvert && (
          <motion.nav
            aria-label="Changer de vue (démo)"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2 w-52 overflow-hidden rounded-2xl border border-cream/10 bg-night p-1.5 text-cream shadow-lift"
          >
            {VUES.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                onClick={() => choisir(v.zone)}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-cream/10",
                  actif === v.href && "bg-cream/10 text-brand-light",
                )}
              >
                <v.icon className="size-4" aria-hidden />
                {v.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={basculer}
        aria-expanded={ouvert}
        className="flex h-10 items-center gap-2 rounded-full border border-cream/15 bg-night/90 ps-3 pe-3.5 text-[13px] font-semibold text-cream shadow-lift backdrop-blur transition-transform hover:scale-[1.02]"
      >
        <FlaskConical className="size-4 text-brand-light" aria-hidden />
        Démo
        <ChevronDown className={cn("size-3.5 transition-transform", ouvert && "rotate-180")} aria-hidden />
      </button>
    </div>
  );
}
