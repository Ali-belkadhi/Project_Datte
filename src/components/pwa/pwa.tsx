"use client";
/**
 * PWA (socle commun) :
 *  - enregistrement du Service Worker /sw.js (mode hors ligne) ;
 *  - bandeau « Vous êtes hors ligne » ;
 *  - bouton « Installer l'application » (événement beforeinstallprompt, Chrome / Edge / Android).
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

function abonnementReseau(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function Pwa() {
  const enLigne = useSyncExternalStore(abonnementReseau, () => navigator.onLine, () => true);
  const [installation, setInstallation] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // en développement, le Service Worker passe en « réseau d'abord » pour ne jamais servir du code périmé
    const url = process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?dev=1";
    navigator.serviceWorker.register(url, { scope: "/" }).catch((e) => console.warn("[pwa] Service Worker non enregistré", e));
  }, []);

  useEffect(() => {
    const surInvite = (e: Event) => {
      e.preventDefault();
      setInstallation(e as InstallEvent);
    };
    const surInstallee = () => setInstallation(null);
    window.addEventListener("beforeinstallprompt", surInvite);
    window.addEventListener("appinstalled", surInstallee);
    return () => {
      window.removeEventListener("beforeinstallprompt", surInvite);
      window.removeEventListener("appinstalled", surInstallee);
    };
  }, []);

  return (
    <>
      {!enLigne && (
        <div role="status" className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-night px-4 py-2 text-[13px] font-medium text-cream">
          <WifiOff className="size-4" aria-hidden /> Vous êtes hors ligne : les pages déjà consultées restent disponibles.
        </div>
      )}
      {installation && (
        <div className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border bg-card p-3 shadow-lift lg:bottom-6">
          <Image src="/icons/icon-192.png" alt="" width={40} height={40} className="size-10 rounded-xl" />
          <p className="min-w-0 flex-1 text-sm">
            <span className="block font-semibold">Installer DEGLA</span>
            <span className="block text-[12px] text-muted-foreground">Accès direct depuis l&apos;écran d&apos;accueil, même hors ligne.</span>
          </p>
          <Button
            size="sm"
            variant="brand"
            onClick={async () => {
              await installation.prompt();
              await installation.userChoice;
              setInstallation(null);
            }}
          >
            <Download aria-hidden /> Installer
          </Button>
          <Button size="icon" variant="ghost" aria-label="Fermer" onClick={() => setInstallation(null)}>
            <X aria-hidden />
          </Button>
        </div>
      )}
    </>
  );
}
