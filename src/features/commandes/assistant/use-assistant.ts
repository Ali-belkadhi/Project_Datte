"use client";
/**
 * IA-C — état du chat de l'assistant (useChat du Vercel AI SDK) + confirmation d'ajout au panier.
 * L'outil `ajouterAuPanier` n'a pas d'execute côté serveur : le client confirme, l'ajout passe par
 * la Server Action (Zod + rôle), puis le résultat est renvoyé au modèle avec addToolOutput.
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MessageAssistant } from "@/server/modules/commandes/services/assistant-ia";
import type { ProduitAvecVendeur } from "@/types/domain";
import { formatPoids } from "@/lib/format";
import { ligneDepuisProduit } from "@/lib/panier";
import { ajouterAuPanier } from "@/server/modules/commandes/actions";
import { useCartStore } from "@/stores/cart-store";

export type { MessageAssistant };
export type PartAjout = Extract<MessageAssistant["parts"][number], { type: "tool-ajouterAuPanier" }>;

/** Produit complet correspondant à une proposition d'ajout (cherché dans les résultats de recherche). */
export function produitPropose(messages: MessageAssistant[], produitId: string): ProduitAvecVendeur | undefined {
  for (const m of messages) {
    for (const p of m.parts) {
      if (p.type === "tool-rechercherProduits" && p.state === "output-available") {
        const item = p.output.find((x) => x.produit.id === produitId);
        if (item) return item;
      }
    }
  }
}

export function useAssistant() {
  const chat = useChat<MessageAssistant>({
    transport: new DefaultChatTransport({ api: "/api/ia/assistant" }),
    // relance le modèle dès que le client a répondu à la confirmation d'ajout
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const ajouterAuStore = useCartStore((s) => s.ajouter);
  const router = useRouter();

  const repondreAjout = async (part: PartAjout, confirme: boolean) => {
    if (part.state !== "input-available") return;
    const { produitId, nomProduit, quantiteGrammes, quantiteUnites } = part.input;
    if (!confirme) {
      void chat.addToolOutput({ tool: "ajouterAuPanier", toolCallId: part.toolCallId, output: { confirme: false, message: "Le client a refusé l'ajout." } });
      return;
    }
    const item = produitPropose(chat.messages, produitId);
    const r = await ajouterAuPanier({ produitId, quantiteGrammes, quantiteUnites });
    if (!r.ok) {
      toast.error(r.error.message);
      void chat.addToolOutput({ tool: "ajouterAuPanier", toolCallId: part.toolCallId, output: { confirme: false, message: `Ajout impossible : ${r.error.message}` } });
      return;
    }
    if (item) ajouterAuStore(ligneDepuisProduit(item, { quantiteGrammes, quantiteUnites }));
    const qte = quantiteGrammes ? formatPoids(quantiteGrammes) : `${quantiteUnites ?? 1} unité${(quantiteUnites ?? 1) > 1 ? "s" : ""}`;
    toast.success("Ajouté au panier", { description: `${nomProduit} · ${qte}`, action: { label: "Voir le panier", onClick: () => router.push("/panier") } });
    void chat.addToolOutput({ tool: "ajouterAuPanier", toolCallId: part.toolCallId, output: { confirme: true, message: `${nomProduit} (${qte}) ajouté au panier.` } });
  };

  const envoyer = (texte: string) => {
    const t = texte.trim();
    if (t && chat.status === "ready") void chat.sendMessage({ text: t });
  };

  return { ...chat, envoyer, repondreAjout, occupe: chat.status === "submitted" || chat.status === "streaming" };
}
