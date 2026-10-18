"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useMounted } from "@/hooks/use-mounted";

/** Icône panier avec compteur : rebond à chaque ajout, badge animé (scale). */
export function CartButton({ className, tone = "default" }: { className?: string; tone?: "default" | "dark" }) {
  const count = useCartStore((s) => s.lignes.length);
  const pulse = useCartStore((s) => s.pulse);
  const mounted = useMounted();
  const reduit = useReducedMotion();
  const n = mounted ? count : 0;
  return (
    <Link
      href="/panier"
      aria-label={`Panier, ${n} article${n > 1 ? "s" : ""}`}
      className={cn(
        "relative grid size-11 place-items-center rounded-full transition-colors",
        tone === "dark" ? "text-cream hover:bg-cream/10" : "hover:bg-accent",
        className,
      )}
    >
      <motion.span key={pulse} animate={reduit || pulse === 0 ? undefined : { y: [0, -5, 0], rotate: [0, -8, 6, 0] }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
        <ShoppingBag className="size-5" aria-hidden />
      </motion.span>
      <AnimatePresence>
        {n > 0 && (
          <motion.span
            key={n}
            initial={reduit ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute end-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-foreground tabular-nums"
          >
            {n}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
