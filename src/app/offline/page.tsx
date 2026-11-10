"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, ShoppingBag, Database, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/** Page de secours hors-ligne DEGLA (PWA) */
export default function OfflinePage() {
  const recharger = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main id="contenu" className="min-h-dvh bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        {/* En-tête de marque */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Badge & Icône d'état */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative grid size-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-600 ring-8 ring-amber-500/5 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/5">
            <WifiOff className="size-10 animate-pulse" aria-hidden />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="size-2 rounded-full bg-amber-500" />
            Mode hors-ligne actif · PWA DEGLA
          </div>
        </div>

        {/* Titres explicatifs */}
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl text-balance">
            Vous naviguez actuellement sans connexion
          </h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground leading-relaxed">
            Les pages, variétés et dattes déjà consultées restent consultables depuis le cache de votre appareil.
          </p>
        </div>

        {/* Grille explicative des fonctionnalités */}
        <div className="grid gap-4 text-start sm:grid-cols-2">
          {/* Accessible hors ligne */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle2 className="size-4" />
              <span>Accessible hors ligne</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                <span>Consultation des fiches produits en cache</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                <span>Variétés et terroir déjà visités</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">•</span>
                <span>Visualisation 3D des modèles en mémoire</span>
              </li>
            </ul>
          </div>

          {/* Nécessite le serveur */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3">
              <Database className="size-4" />
              <span>Nécessite le serveur</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Enregistrements et modifications en base</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span className="flex items-center gap-1">
                  Génération IA & 3D TRELLIS <Sparkles className="size-3 text-brand" />
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Validation et paiement des commandes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button onClick={recharger} variant="brand" size="lg" className="gap-2">
            <RefreshCw className="size-4" />
            Réessayer la connexion
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/boutique">
              <ShoppingBag className="size-4" />
              Catalogue en cache
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="gap-2">
            <Link href="/">
              Accueil
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
