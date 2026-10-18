"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  actionChargerMessages,
  actionEnvoyerMessage,
  actionMarquerLus,
  type MessageVue,
} from "@/server/actions/messagerie.actions";
import { Send } from "lucide-react";

export function FilDiscussion({
  conversationId,
  messagesInitiaux,
}: {
  conversationId: string;
  messagesInitiaux: MessageVue[];
}) {
  const [messages, setMessages] = useState<MessageVue[]>(messagesInitiaux);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  async function rafraichir() {
    const reponse = await actionChargerMessages(conversationId);
    if (reponse.success) {
      setMessages((precedents) => {
        if (reponse.messages.length !== precedents.length) {
          void actionMarquerLus(conversationId);
        }
        return reponse.messages;
      });
    }
  }

  // Polling V1 (toutes les 4 s)
  useEffect(() => {
    const intervalle = setInterval(rafraichir, 4000);
    return () => clearInterval(intervalle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu || envoi) return;

    setEnvoi(true);
    const reponse = await actionEnvoyerMessage(conversationId, contenu);
    if (reponse.success) {
      setTexte("");
      await rafraichir();
    }
    setEnvoi(false);
  }

  return (
    <div className="flex h-[65vh] flex-col rounded-3xl border border-forest/10 bg-cream-50/90">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            Aucun message pour l&apos;instant. Lancez la conversation.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.estMoi ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.estMoi
                    ? "bg-forest text-cream"
                    : "border border-forest/10 bg-white text-ink"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.contenu}</p>
                <p
                  className={cn(
                    "mt-1 text-[0.65rem]",
                    m.estMoi ? "text-cream/70" : "text-muted"
                  )}
                >
                  {new Date(m.creeLe).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={finRef} />
      </div>

      <form
        onSubmit={envoyer}
        className="flex items-center gap-2 border-t border-forest/10 p-4"
      >
        <Input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrire un message…"
          maxLength={2000}
          className="h-11"
        />
        <Button type="submit" size="icon" disabled={envoi || !texte.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
