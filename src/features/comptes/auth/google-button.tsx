"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** « Continuer avec Google » — VISUEL (Auth.js plus tard). Logo générique « G » (pas de marque déposée reproduite). */
export function GoogleButton() {
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => toast("Connexion Google bientôt disponible (démo)")}>
      <span aria-hidden className="grid size-5 place-items-center rounded-full border text-[11px] font-bold">G</span>
      Continuer avec Google
    </Button>
  );
}

export function Separateur({ texte = "ou" }: { texte?: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {texte}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
