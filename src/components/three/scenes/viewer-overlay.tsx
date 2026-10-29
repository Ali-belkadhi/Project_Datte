"use client";
import { Expand, Hand, RotateCcw, ScanEye } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const btn =
  "grid size-11 place-items-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-soft backdrop-blur transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50";

/** Boutons superposés au viewer : Recentrer, Plein écran, Voir chez moi (AR) + indication. */
export function ViewerOverlay({
  onReset,
  onFullscreen,
  indication,
  dark = false,
  glbUrl,
}: {
  onReset: () => void;
  onFullscreen: () => void;
  indication: boolean;
  dark?: boolean;
  glbUrl?: string;
}) {
  const lancerAR = () => {
    if (!glbUrl) {
      toast.info("Réalité augmentée", {
        description: "Ce produit n'a pas encore de modèle 3D haute fidélité disponible en AR.",
      });
      return;
    }

    const fullUrl = glbUrl.startsWith("http")
      ? glbUrl
      : `${window.location.origin}${glbUrl}`;

    // Détection iOS / Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid) {
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
        fullUrl
      )}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = intentUrl;
    } else if (isIOS) {
      // iOS Quick Look requiert USDZ ou fallback
      toast("Mode Réalité Augmentée (iOS)", {
        description: "Visualisation 3D interactive prête pour Quick Look.",
      });
      window.open(fullUrl, "_blank");
    } else {
      toast.success("Réalité Augmentée DEGLA", {
        description:
          "Ouvrez cette page sur votre smartphone (Android/iOS) pour projeter cette datte directement sur votre table !",
      });
    }
  };

  return (
    <>
      <div className="absolute end-3 top-3 flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onReset} className={btn} aria-label="Recentrer la vue">
              <RotateCcw className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Recentrer</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onFullscreen} className={btn} aria-label="Plein écran">
              <Expand className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Plein écran</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={lancerAR}
              className={cn(btn, glbUrl && "border-brand text-brand hover:bg-brand-soft")}
              aria-label="Voir en Réalité Augmentée (AR)"
            >
              <ScanEye className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {glbUrl ? "Voir chez moi (Réalité Augmentée)" : "Mode AR"}
          </TooltipContent>
        </Tooltip>
      </div>
      <AnimatePresence>
        {indication && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "pointer-events-none absolute bottom-4 start-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold backdrop-blur rtl:translate-x-1/2",
              dark ? "bg-cream/15 text-cream" : "bg-night/80 text-cream"
            )}
          >
            <Hand className="size-4" aria-hidden /> Glissez pour tourner
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
