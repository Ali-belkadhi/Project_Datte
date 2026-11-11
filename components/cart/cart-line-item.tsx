"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ProductMedia } from "@/components/products/product-media";

export function QuantityStepper({
  value,
  onChange,
  max = 99,
  size = "sm",
  label = "Quantité",
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: "sm" | "lg";
  label?: string;
}) {
  const btn = cn(
    "flex items-center justify-center rounded-full text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-forest",
    size === "lg" ? "size-11" : "size-8",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border border-forest/15 bg-cream-50", size === "lg" ? "p-1" : "p-0.5")}
    >
      <button type="button" aria-label="Diminuer la quantité" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1}>
        <Minus className="size-3.5" />
      </button>
      <span aria-live="polite" className={cn("text-center font-semibold tabular-nums text-forest", size === "lg" ? "w-10" : "w-7 text-sm")}>
        {value}
      </span>
      <button type="button" aria-label="Augmenter la quantité" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function CartLineItem({ item, compact = false, onNavigate }: { item: CartItem; compact?: boolean; onNavigate?: () => void }) {
  const { updateQuantity, removeItem } = useCartStore();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 py-4"
    >
      <Link href={`/produits/${item.slug}`} onClick={onNavigate} className="shrink-0">
        <ProductMedia
          src={item.image}
          alt={item.name}
          sizes="96px"
          className={cn("rounded-2xl", compact ? "size-20" : "size-24 sm:size-28")}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/produits/${item.slug}`} onClick={onNavigate} className="block truncate font-serif text-lg leading-tight text-forest hover:text-gold-dark">
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
          </div>
          <button
            type="button"
            aria-label={`Retirer ${item.name} du panier`}
            onClick={() => removeItem(item.productId)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <QuantityStepper
            value={item.quantity}
            max={item.maxQuantity}
            onChange={(q) => updateQuantity(item.productId, q)}
          />
          <div className="text-right">
            <p className="font-semibold text-forest">{formatPrice(item.price * item.quantity)}</p>
            {item.quantity > 1 && <p className="text-[0.7rem] text-muted">{formatPrice(item.price)} / unité</p>}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
