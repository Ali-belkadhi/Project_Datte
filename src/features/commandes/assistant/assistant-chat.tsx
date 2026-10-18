"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Monogram } from "@/components/brand/monogram";
import { OasisScene } from "@/components/illustrations/scenes";
import { AiBadge } from "@/components/shared/ai-badge";
import { cn } from "@/lib/utils";
import { SuggestionChips } from "./suggestion-chips";
import { ToolResultCard } from "./tool-result-card";
import { useScriptedAssistant, type DonneesAssistant } from "./use-scripted-assistant";

/** Chat de l'assistant d'achat (IA-C) — plein écran sur mobile, ou dans une Sheet latérale. */
export function AssistantChat({ data, prenom = "Sarra", compact = false }: { data: DonneesAssistant; prenom?: string; compact?: boolean }) {
  const { messages, reflechit, envoyer, resoudre, reinitialiser } = useScriptedAssistant(data);
  const [saisie, setSaisie] = useState("");
  const fin = useRef<HTMLDivElement>(null);
  const reduit = useReducedMotion();

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: reduit ? "auto" : "smooth", block: "end" });
  }, [messages, reflechit, reduit]);

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
          <button type="button" onClick={reinitialiser} className="grid size-10 place-items-center rounded-full hover:bg-accent" aria-label="Nouvelle conversation">
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
            <h2 className="font-display text-2xl font-semibold text-balance">Bonjour {prenom}, que cherchez-vous aujourd&apos;hui ?</h2>
            <p className="text-[15px] text-muted-foreground">Je peux chercher des dattes, comparer des variétés, suivre une commande ou vous proposer un cadeau.</p>
            <SuggestionChips suggestions={data.suggestions} onSelect={soumettre} className="justify-center" />
          </div>
        ) : (
          <ul className="mx-auto max-w-2xl space-y-4">
            {messages.map((m) => (
              <motion.li
                key={m.id}
                initial={reduit ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}
              >
                <p
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap",
                    m.role === "user" ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md border bg-card",
                  )}
                >
                  {m.texte}
                  {m.enCours && <span className="ms-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-brand-fill align-middle" aria-hidden />}
                </p>
                {m.resultat && (
                  <div className="w-full max-w-[96%]">
                    <ToolResultCard resultat={m.resultat} resolu={m.resolu} onResoudre={(d) => resoudre(m.id, d)} />
                  </div>
                )}
              </motion.li>
            ))}
            {reflechit && (
              <li className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Sparkles className="size-4 animate-pulse text-brand" aria-hidden /> réfléchit…
              </li>
            )}
          </ul>
        )}
        <div ref={fin} />
      </div>

      {messages.length > 0 && !reflechit && (
        <div className="scrollbar-none overflow-x-auto border-t px-4 pt-3">
          <SuggestionChips suggestions={data.suggestions} onSelect={soumettre} className="flex-nowrap [&>li]:shrink-0" />
        </div>
      )}
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
        <div className="flex h-12 flex-1 items-center rounded-full border bg-card ps-4 pe-1 focus-within:border-ring">
          <input
            id="assistant-saisie"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Posez votre question…"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
            autoComplete="off"
          />
          <button type="button" className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-accent" aria-label="Dicter (bientôt disponible)">
            <Mic className="size-[18px]" />
          </button>
        </div>
        <button type="submit" disabled={!saisie.trim() || reflechit} className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground disabled:opacity-40" aria-label="Envoyer">
          <SendHorizontal className="size-5 rtl:rotate-180" />
        </button>
      </form>
    </div>
  );
}
