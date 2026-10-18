"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { actionDeconnecter } from "@/server/actions/auth.actions";
import { LogOut, Loader2 } from "lucide-react";

export function BoutonDeconnexion({ className }: { className?: string }) {
  const [enCours, demarrer] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      disabled={enCours}
      onClick={() => demarrer(() => actionDeconnecter())}
    >
      {enCours ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Déconnexion
    </Button>
  );
}
