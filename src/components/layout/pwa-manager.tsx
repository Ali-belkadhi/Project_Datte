"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, WifiOff, X, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __degla_install_pwa?: () => Promise<boolean>;
  }
}

/**
 * PwaManager — Gestionnaire PWA & Hors-ligne pour DEGLA.
 * - Enregistrement du Service Worker
 * - Détection et notifications En Ligne / Hors Ligne
 * - Invite d'installation native (beforeinstallprompt) dans le design Oasis Contemporaine
 */
export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // 1. Enregistrement du Service Worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Enregistrer le SW après chargement complet pour ne pas impacter les métriques web initiales
    const registerSW = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Vérification périodique des mises à jour du cache
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener("statechange", () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  toast.info("Une nouvelle version de DEGLA est disponible.", {
                    action: {
                      label: "Actualiser",
                      onClick: () => window.location.reload(),
                    },
                  });
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker non enregistré :", err);
        });
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
      return () => window.removeEventListener("load", registerSW);
    }
  }, []);

  // 2. Gestion de l'état réseau (En ligne / Hors-ligne)
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Mode hors-ligne activé", {
        description:
          "Vous consultez les contenus en mémoire cache. L'enregistrement en base et la génération IA nécessitent le serveur.",
        duration: 6000,
        icon: <WifiOff className="size-4 text-amber-500" />,
      });
    };

    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Connexion rétablie", {
        description: "Vous êtes de nouveau connecté au serveur DEGLA.",
        duration: 4000,
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // 3. Détection de l'événement d'installation PWA (Chrome, Edge, Samsung Internet, Android)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);

      // Exposer une fonction globale d'installation pour les boutons d'en-tête ou de menu
      window.__degla_install_pwa = async () => {
        if (!promptEvent) return false;
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setCanInstall(false);
          setDeferredPrompt(null);
          return true;
        }
        return false;
      };

      // Notifier les composants d'interface
      window.dispatchEvent(new CustomEvent("degla:pwa-ready", { detail: { canInstall: true } }));
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
      toast.success("Application DEGLA installée avec succès !", {
        description: "Vous pouvez désormais l'ouvrir directement depuis votre écran d'accueil.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Action d'installation
  const installerApp = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return (
    <>
      {/* 1. Bandeau supérieur discret lors du mode hors-ligne */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-[70] flex items-center justify-center gap-2 border-b border-amber-600/30 bg-amber-500/95 px-3 py-1.5 text-center text-xs font-semibold text-white shadow-md backdrop-blur-md print:hidden"
        >
          <WifiOff className="size-3.5 shrink-0" aria-hidden />
          <span>
            Mode hors-ligne · Consultation du cache local active. Les enregistrements et la génération IA sont suspendus.
          </span>
        </aside>
      )}

      {/* 2. Bannière discrète d'installation PWA si disponible */}
      {canInstall && !bannerDismissed && (
        <aside
          role="region"
          aria-label="Installation de l'application DEGLA"
          className="fixed bottom-4 end-4 z-[55] max-w-sm rounded-2xl border border-border/80 bg-background/95 p-4 text-foreground shadow-lift backdrop-blur-xl transition-all sm:end-6 sm:bottom-6 print:hidden"
        >
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm">
              <Download className="size-5" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-foreground">
                  Installer l&apos;application DEGLA
                </p>
                <button
                  type="button"
                  onClick={() => setBannerDismissed(true)}
                  aria-label="Fermer la proposition d'installation"
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Profitez d&apos;une expérience fluide, rapide et disponible hors-ligne directement depuis votre appareil.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" variant="brand" onClick={installerApp} className="h-8 gap-1.5 text-xs font-semibold">
                  <Download className="size-3.5" />
                  Installer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setBannerDismissed(true)}
                  className="h-8 text-xs text-muted-foreground"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
