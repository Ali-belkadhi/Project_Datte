"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { Monogram } from "@/components/brand/monogram";
import { OasisScene } from "@/components/illustrations/scenes";
import { AiBadge } from "@/components/shared/ai-badge";
import { cn } from "@/lib/utils";
import { AssistantMessage } from "./assistant-parts";
import { SuggestionChips } from "./suggestion-chips";
import { useAssistant } from "./use-assistant";

export const SUGGESTIONS_ASSISTANT = [
  "2 kg de Deglet Nour bio à moins de 30 DT",
  "Différence entre Alig et Kenta ?",
  "Où est ma commande ?",
  "Une confiture de dattes",
];

/** Chat de l'assistant d'achat (IA-C), plein écran : onglet « Assistant » de la barre du bas. */
export function AssistantChat({ prenom, compact = false }: { prenom?: string; compact?: boolean }) {
  const { messages, setMessages, envoyer, repondreAjout, occupe, error, stop } = useAssistant();
  const [saisie, setSaisie] = useState("");
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, occupe]);

  const soumettre = (q: string) => {
    envoyer(q);
    setSaisie("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <span className="grid size-10 place-items-center rounded-full bg-night">
          <Monogram className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-display text-lg leading-tight font-semibold">
            Assistant DEGLA <AiBadge />
          </p>
          <p className="truncate text-[13px] text-muted-foreground">Conseils, recherche et suivi de commande</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              void stop();
              setMessages([]);
            }}
            className="grid size-10 place-items-center rounded-full hover:bg-accent"
            aria-label="Nouvelle conversation"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5 pt-4 text-center">
            <div className={cn("w-full overflow-hidden rounded-3xl bg-sand", compact ? "h-28" : "h-40")}>
              <OasisScene />
            </div>
            <h2 className="font-display text-2xl font-semibold text-balance">Bonjour{prenom ? ` ${prenom}` : ""}, que cherchez-vous aujourd&apos;hui ?</h2>
            <p className="text-[15px] text-muted-foreground">Je peux chercher des dattes, comparer des variétés, ajouter au panier avec votre accord ou suivre une commande.</p>
            <SuggestionChips suggestions={SUGGESTIONS_ASSISTANT} onSelect={soumettre} className="justify-center" />
          </div>
        ) : (
          <ul className="mx-auto max-w-2xl space-y-4">
            {messages.map((m) => (
              <li key={m.id}>
                <AssistantMessage message={m} messages={messages} onAjout={repondreAjout} />
              </li>
            ))}
            {occupe && messages.at(-1)?.role === "user" && (
              <li className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Sparkles className="size-4 animate-pulse text-brand" aria-hidden /> réfléchit…
              </li>
            )}
            {error && <li className="text-sm text-destructive">L&apos;assistant n&apos;a pas pu répondre. Vérifiez votre connexion et réessayez.</li>}
          </ul>
        )}
        <div ref={fin} />
      </div>

      <form
        className="sticky bottom-0 flex items-center gap-2 bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          soumettre(saisie);
        }}
      >
        <label htmlFor="assistant-saisie" className="sr-only">
          Votre question
        </label>
        <input
          id="assistant-saisie"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Posez votre question…"
          maxLength={500}
          className="h-12 min-w-0 flex-1 rounded-full border bg-card px-4 text-[15px] outline-none focus:border-ring"
          autoComplete="off"
        />
        <button type="submit" disabled={!saisie.trim() || occupe} className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground disabled:opacity-40" aria-label="Envoyer">
          <SendHorizontal className="size-5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}
