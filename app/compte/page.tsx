import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mon Compte",
  description: "Gérez votre profil client SIWAR et suivez vos commandes.",
};

export default function ComptePage() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        eyebrow="ESPACE PRIVÉ"
        title="Mon Compte"
        description="Bienvenue dans votre espace personnel SIWAR."
        crumbs={[{ label: "Mon compte" }]}
      />

      <div className="container-lux mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 rounded-3xl bg-cream-50/80 border border-forest/10 p-6">
            <div className="flex items-center gap-4 pb-6 border-b border-forest/10">
              <div className="flex size-14 items-center justify-center rounded-full bg-forest text-cream font-serif text-xl font-semibold">
                SB
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-forest">Sarra Ben Salem</h3>
                <p className="text-xs text-muted">sarra.bensalem@gmail.com</p>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl bg-forest text-cream px-4 py-3 text-sm font-medium"
              >
                <Package className="size-4 text-gold-light" /> Mes Commandes
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest hover:bg-beige/40 transition-colors"
              >
                <User className="size-4" /> Informations Personnelles
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest hover:bg-beige/40 transition-colors"
              >
                <MapPin className="size-4" /> Adresses de Livraison
              </button>
              <Link
                href="/produits"
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-forest hover:bg-beige/40 transition-colors"
              >
                <Heart className="size-4" /> Mes Favoris
              </Link>
            </nav>

            <div className="mt-8 pt-6 border-t border-forest/10">
              <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10">
                <LogOut className="size-4 mr-2" /> Déconnexion
              </Button>
            </div>
          </div>

          {/* Main Area: Orders */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl bg-cream-50/80 border border-forest/10 p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-medium text-forest mb-6">
                Historique des commandes
              </h2>

              <div className="rounded-2xl border border-forest/15 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest/10 pb-3">
                  <div>
                    <span className="font-serif font-semibold text-forest">Commande #SIWAR-2026-8492</span>
                    <p className="text-xs text-muted">Passée le 14 Octobre 2026</p>
                  </div>
                  <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                    En cours de préparation
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink/80">1 × Coffret Prestige (89 DT) + 1 × Sirop de Dattes (19 DT)</span>
                  <span className="font-serif font-semibold text-forest text-base">108 DT</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/produits">Découvrir d&apos;autres créations</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
