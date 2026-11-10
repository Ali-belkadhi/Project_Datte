"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Bouton d'installation PWA dans le header ou menu */
export function PwaInstallButton({ className }: { className?: string }) {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Vérifier si la fonction d'installation est déjà prête
    if (typeof window !== "undefined" && window.__degla_install_pwa) {
      setCanInstall(true);
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ canInstall: boolean }>;
      if (custom.detail?.canInstall) {
        setCanInstall(true);
      }
    };

    window.addEventListener("degla:pwa-ready", handler);
    return () => window.removeEventListener("degla:pwa-ready", handler);
  }, []);

  if (!canInstall) return null;

  const handleClick = async () => {
    if (typeof window !== "undefined" && window.__degla_install_pwa) {
      const installed = await window.__degla_install_pwa();
      if (installed) {
        setCanInstall(false);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className || "hidden h-10 items-center gap-1.5 rounded-full border-brand/30 bg-brand/5 px-3.5 text-xs font-semibold text-brand hover:bg-brand/10 hover:text-brand sm:inline-flex"}
      title="Installer l'application DEGLA sur votre écran d'accueil"
    >
      <Download className="size-3.5" />
      <span>Installer</span>
    </Button>
  );
}
