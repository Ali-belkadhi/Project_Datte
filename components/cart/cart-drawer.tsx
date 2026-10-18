"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ShoppingBag, Truck, X } from "lucide-react";
import { useCartStore, selectCartCount, selectCartSubtotal } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useLockBody, useMounted } from "@/hooks/use-client";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/data/products";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "./cart-line-item";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const pct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  return (
    <div className="rounded-2xl bg-beige/45 p-4">
      <p className="flex items-center gap-2 text-xs text-ink/80">
        <Truck className="size-4 text-gold" />
        {remaining > 0 ? (
          <span>
            Plus que <strong className="text-forest">{formatPrice(remaining)}</strong> pour la livraison offerte
          </span>
        ) : (
          <span className="font-semibold text-forest">Livraison offerte sur votre commande 🎉</span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cream-50">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore();
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const mounted = useMounted();
  useLockBody(cartOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <AnimatePresence>
      {cartOpen && mounted && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="bg-grain absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-lux"
          >
            <header className="flex items-center justify-between border-b border-forest/10 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl text-forest">Votre panier</h2>
                <p className="text-xs text-muted">{count} article{count > 1 ? "s" : ""}</p>
              </div>
              <button
                type="button"
                aria-label="Fermer le panier"
                onClick={closeCart}
                className="flex size-10 items-center justify-center rounded-full bg-forest/5 text-forest transition-colors hover:bg-forest hover:text-cream"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-beige/60">
                  <ShoppingBag className="size-8 text-gold" />
                </div>
                <p className="mt-6 font-serif text-2xl text-forest">Votre panier est vide</p>
                <p className="mt-2 text-sm text-muted">Laissez-vous tenter par les trésors de Kébili.</p>
                <Button asChild className="mt-8" onClick={closeCart}>
                  <Link href="/produits">
                    Découvrir nos produits <ArrowRight />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-4">
                  <FreeShippingMeter subtotal={subtotal} />
                </div>
                <ul className="flex-1 divide-y divide-forest/10 overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartLineItem key={item.productId} item={item} compact onNavigate={closeCart} />
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="space-y-4 border-t border-forest/10 bg-cream-50/80 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Sous-total</span>
                    <span className="font-serif text-2xl font-semibold text-forest">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-muted">Frais de livraison calculés à l&apos;étape suivante.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" onClick={closeCart}>
                      <Link href="/panier">Voir le panier</Link>
                    </Button>
                    <Button asChild onClick={closeCart}>
                      <Link href="/commande">
                        Commander <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
