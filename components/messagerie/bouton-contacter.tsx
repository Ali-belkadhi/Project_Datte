"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { actionDemarrerConversation } from "@/server/actions/messagerie.actions";
import { MessageCircle } from "lucide-react";

export function BoutonContacter({
  fournisseurId,
  produitId,
  className,
}: {
  fournisseurId: string;
  produitId?: string;
  className?: string;
}) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function contacter() {
    setErreur(null);
    demarrer(async () => {
      try {
        const reponse = await actionDemarrerConversation(fournisseurId, produitId);
        if (reponse.success && reponse.conversationId) {
          router.push(`/messages/${reponse.conversationId}`);
          return;
        }
        setErreur(reponse.error ?? "Impossible de démarrer la conversation.");
      } catch {
        router.push(`/connexion?callbackUrl=${encodeURIComponent("/messages")}`);
      }
    });
  }

  return (
    <div className={className}>
      <Button variant="gold" onClick={contacter} disabled={enCours} className="rounded-full">
        <MessageCircle className="size-4" />
        {enCours ? "Ouverture…" : "Contacter le vendeur"}
      </Button>
      {erreur && <p className="mt-2 text-xs text-destructive">{erreur}</p>}
    </div>
  );
}
