"use client";
/**
 * IA-C — petite fenêtre de chat flottante (toutes les pages acheteur).
 * Même moteur que la page /assistant (useChat → /api/ia/assistant) ; résultats d'outils en composants.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssistantMessage } from "./assistant-parts";
import { SUGGESTIONS_ASSISTANT } from "./assistant-chat";
import { useAssistant } from "./use-assistant";

export function AssistantPopup() {
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const { messages, envoyer, repondreAjout, occupe, error } = useAssistant();
  const fin = useRef<HTMLDivElement>(null);
  const chemin = usePathname();

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, occupe]);

  if (chemin?.startsWith("/assistant")) return null; // la page plein écran suffit

  const soumettre = (t: string) => {
    envoyer(t);
    setSaisie("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls="assistant-degla"
        aria-label={ouvert ? "Fermer l'assistant" : "Ouvrir l'assistant d'achat"}
        className="fixed end-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-night text-cream shadow-lift transition-transform hover:scale-105 lg:end-6 lg:bottom-6"
      >
        {ouvert ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
        {!ouvert && <Sparkles className="absolute -top-0.5 -end-0.5 size-5 rounded-full bg-brand-fill p-0.5 text-night" aria-hidden />}
      </button>

      {ouvert && (
        <section
          id="assistant-degla"
          aria-label="Assistant d'achat DEGLA"
          className="fixed inset-x-3 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] z-50 flex max-h-[min(560px,calc(100dvh-12rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-lift sm:inset-x-auto sm:end-4 sm:w-[400px] lg:end-6 lg:bottom-24"
        >
          <header className="flex items-center gap-2 border-b bg-night px-4 py-3 text-cream">
            <Sparkles className="size-4 text-brand-light" aria-hidden />
            <p className="flex-1 font-semibold">Assistant DEGLA</p>
            <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" className="rounded-full p-1 hover:bg-cream/10">
              <X className="size-4" aria-hidden />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            <p className="max-w-[88%] rounded-2xl rounded-es-md bg-sand px-3 py-2 text-sm">
              Bonjour ! Je suis le conseiller DEGLA. Je peux chercher des dattes, comparer des variétés, ajouter au panier avec votre accord ou suivre votre commande.
            </p>
            {messages.map((m) => (
              <AssistantMessage key={m.id} message={m} messages={messages} onAjout={repondreAjout} compact />
            ))}
            {occupe && messages.at(-1)?.role === "user" && (
              <p className="inline-flex items-center gap-2 rounded-2xl bg-sand px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Je cherche…
              </p>
            )}
            {error && <p className="text-sm text-destructive">L&apos;assistant n&apos;a pas pu répondre. Réessayez.</p>}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS_ASSISTANT.map((s) => (
                  <button key={s} type="button" onClick={() => soumettre(s)} className="rounded-full border bg-background px-3 py-1.5 text-[12px] hover:bg-muted">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={fin} />
          </div>

          <form
            className="flex gap-2 border-t p-3"
            onSubmit={(e) => {
              e.preventDefault();
              soumettre(saisie);
            }}
          >
            <Input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Posez votre question…" aria-label="Votre question" maxLength={500} />
            <Button type="submit" size="icon" variant="brand" disabled={occupe || !saisie.trim()} aria-label="Envoyer">
              <Send aria-hidden />
            </Button>
          </form>
        </section>
      )}
    </>
  );
}
