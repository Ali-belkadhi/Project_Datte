"use client";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { demarrerConversation } from "@/server/modules/comptes/actions";

/** Ouvre (ou retrouve) la conversation avec un vendeur puis bascule sur la messagerie. */
export function ContactSellerButton({ fournisseurId, produitId, variant = "outline", size }: { fournisseurId: string; produitId?: string; variant?: "outline" | "ghost"; size?: "sm" | "default" }) {
  const router = useRouter();
  const { run, pending } = useAction(demarrerConversation, {
    onSuccess: () => router.push("/compte/messages"),
  });
  return (
    <Button type="button" variant={variant} size={size} disabled={pending} onClick={() => void run({ fournisseurId, produitId })}>
      <MessageCircle aria-hidden /> {pending ? "Ouverture…" : "Contacter"}
    </Button>
  );
}
