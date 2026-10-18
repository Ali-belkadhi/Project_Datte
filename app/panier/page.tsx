"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { FreeShippingMeter } from "@/components/cart/cart-drawer";
import { Button } from "@/components/ui/button";
import { useCartStore, selectCartCount, selectCartSubtotal } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";
import { formatPrice } from "@/lib/utils";
import { AnimatePresence } from "motion/react";

export default function PanierPage() {
  const items = useCartStore((s) => s.items);
  const count = useCartStore(selectCartCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const clear = useCartStore((s) => s.clear);
  const mounted = useMounted();

  if (!mounted) {
    return <div className="min-h-screen pt-32 text-center">Chargement de votre panier...</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="COMMANDE"
        title="Votre Panier"
        description={`${count} produit${count > 1 ? "s" : ""} sélectionné${count > 1 ? "s" : ""}`}
        crumbs={[{ label: "Panier" }]}
      />

      <div className="container-lux mt-10">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-sand/60">
              <ShoppingBag className="size-8 text-gold" />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-medium text-forest">Votre panier est vide</h2>
            <p className="mt-2 text-sm text-muted max-w-sm">
              Découvrez nos dattes Deglet Nour, coffrets cadeaux et créations gourmandes de Kébili.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full bg-forest text-cream hover:bg-forest-700">
              <Link href="/produits">
                Découvrir nos produits <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Cart Items list (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center justify-between border-b border-forest/10 pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Articles dans le panier
                </span>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Vider le panier
                </button>
              </div>

              <ul className="divide-y divide-forest/10">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <CartLineItem key={item.productId} item={item} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            {/* Right: Summary Box (5 cols) */}
            <div className="lg:col-span-5 flex flex-col rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-2xl font-medium text-forest mb-4">
                Récapitulatif
              </h3>

              <FreeShippingMeter subtotal={subtotal} />

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Sous-total</span>
                  <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Livraison estimée</span>
                  <span className="font-medium text-forest">Calculée à la commande</span>
                </div>
                <div className="border-t border-forest/10 pt-3 flex justify-between font-serif text-xl font-semibold text-forest">
                  <span>Total estimé</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-8">
                <Button asChild size="lg" className="w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold shadow-md">
                  <Link href="/commande" className="flex items-center justify-center gap-2">
                    Passer la commande <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-forest/10 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-gold" />
                  <span>Livraison rapide partout en Tunisie</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-gold" />
                  <span>Paiement à la livraison ou en ligne sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
