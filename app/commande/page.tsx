"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck, Truck, CreditCard, Banknote, Building2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { useCartStore, selectCartSubtotal } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";
import { shippingOptions, FREE_SHIPPING_THRESHOLD } from "@/data/products";
import { formatPrice } from "@/lib/utils";

type PaymentMethod = "cod" | "card" | "virement";

export default function CommandePage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const clear = useCartStore((s) => s.clear);
  const mounted = useMounted();

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderComplete, setOrderComplete] = useState(false);

  const shipping = shippingOptions.find((o) => o.id === selectedShipping) ?? shippingOptions[0];
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD && selectedShipping === "standard" ? 0 : shipping.price;
  const total = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    clear();
  };

  if (!mounted) {
    return <div className="min-h-screen pt-32 text-center">Chargement...</div>;
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen pb-24">
        <PageHeader eyebrow="CONFIRMATION" title="Merci pour votre commande !" />
        <div className="container-lux mt-12 max-w-2xl text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-forest text-cream mx-auto">
            <CheckCircle2 className="size-10 text-gold-light" />
          </div>
          <h2 className="mt-6 font-serif text-3xl font-medium text-forest">
            Commande #DEGLA-2026-8492
          </h2>
          <p className="mt-3 text-base text-ink/75 leading-relaxed">
            Votre commande a bien été enregistrée. Un SMS et un e-mail de confirmation vous ont été envoyés. Nos artisans préparent votre colis avec le plus grand soin.
          </p>

          <div className="mt-10 rounded-2xl bg-cream-50 p-6 border border-forest/10 text-left">
            <h3 className="font-serif text-lg font-semibold text-forest mb-3">Récapitulatif de livraison</h3>
            <p className="text-sm text-ink/80">Mode de livraison : <strong>{shipping.label}</strong> ({shipping.eta})</p>
            <p className="text-sm text-ink/80 mt-1">Montant total : <strong>{formatPrice(total)}</strong></p>
            <p className="text-sm text-ink/80 mt-1">Paiement : <strong>{paymentMethod === "cod" ? "Paiement à la livraison" : "Carte bancaire"}</strong></p>
          </div>

          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full bg-forest text-cream hover:bg-forest-700">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="FINALISATION"
        title="Validation de la Commande"
        crumbs={[
          { href: "/panier", label: "Panier" },
          { label: "Commande" },
        ]}
      />

      <div className="container-lux mt-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Customer Info */}
            <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-medium text-forest mb-6">
                1. Vos coordonnées
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom" id="first-name" required placeholder="Ex. Mohamed" />
                <Field label="Nom" id="last-name" required placeholder="Ex. Trabelsi" />
                <Field label="E-mail" id="email" type="email" required placeholder="mohamed@example.com" />
                <Field label="Téléphone (mobile)" id="phone" type="tel" required placeholder="+216 98 000 000" />
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-medium text-forest mb-6">
                2. Adresse de livraison
              </h2>
              <div className="space-y-4">
                <Field label="Adresse complète" id="address" required placeholder="Numéro, rue, appartement..." />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Ville" id="city" required placeholder="Ex. Tunis" />
                  <Field label="Gouvernorat" id="state" required placeholder="Ex. Tunis" />
                  <Field label="Code postal" id="postal" required placeholder="Ex. 1000" />
                </div>
              </div>

              {/* Shipping Options */}
              <h3 className="font-serif text-lg font-medium text-forest mt-8 mb-4">
                Mode de livraison
              </h3>
              <div className="space-y-3">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                      selectedShipping === opt.id
                        ? "border-forest bg-sand/30 shadow-xs"
                        : "border-forest/15 hover:border-gold"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.id}
                        checked={selectedShipping === opt.id}
                        onChange={() => setSelectedShipping(opt.id)}
                        className="size-4 text-forest focus:ring-gold"
                      />
                      <div>
                        <p className="font-medium text-sm text-forest">{opt.label}</p>
                        <p className="text-xs text-muted">{opt.description} • {opt.eta}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-forest">
                      {opt.price === 0 || (opt.id === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD)
                        ? "Gratuit"
                        : formatPrice(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-medium text-forest mb-6">
                3. Mode de règlement
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                    paymentMethod === "cod" ? "border-forest bg-sand/30 shadow-xs" : "border-forest/15 hover:border-gold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="size-4 text-forest focus:ring-gold"
                    />
                    <Banknote className="size-5 text-forest" />
                    <div>
                      <p className="font-medium text-sm text-forest">Paiement à la livraison</p>
                      <p className="text-xs text-muted">Réglez en espèces à la réception de votre colis.</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${
                    paymentMethod === "card" ? "border-forest bg-sand/30 shadow-xs" : "border-forest/15 hover:border-gold"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="size-4 text-forest focus:ring-gold"
                    />
                    <CreditCard className="size-5 text-forest" />
                    <div>
                      <p className="font-medium text-sm text-forest">Carte bancaire (GNT / CIB / Visa / Mastercard)</p>
                      <p className="text-xs text-muted">Paiement sécurisé crypté SSL.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8 sticky top-28 shadow-sm">
            <h3 className="font-serif text-2xl font-medium text-forest mb-6">
              Votre commande
            </h3>

            {/* Items list */}
            <ul className="divide-y divide-forest/10 max-h-64 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <li key={item.productId} className="py-3 flex items-center gap-3">
                  <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-forest/5">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-forest">{item.name}</p>
                    <p className="text-xs text-muted">Qté : {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-forest">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-forest/10 pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Sous-total</span>
                <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Frais de port ({shipping.label})</span>
                <span className="font-medium text-forest">
                  {shippingCost === 0 ? "Offert" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-forest/10 pt-3 flex justify-between font-serif text-2xl font-semibold text-forest">
                <span>Total à régler</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-8 w-full rounded-full bg-forest text-cream hover:bg-forest-700 py-6 text-base font-semibold shadow-md"
            >
              Confirmer la commande ({formatPrice(total)})
            </Button>

            <p className="mt-4 text-center text-xs text-muted">
              En confirmant votre commande, vous acceptez nos Conditions Générales de Vente.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
