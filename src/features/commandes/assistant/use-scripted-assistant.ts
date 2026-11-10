"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ResultatOutil, ScenarioAssistant } from "@/types/domain";

export type MessageChat = {
  id: string;
  role: "user" | "assistant";
  texte: string;
  enCours?: boolean;
  resultat?: ResultatOutil;
  resolu?: "confirme" | "annule";
};

export type DonneesAssistant = { scenarios: ScenarioAssistant[]; suggestions: string[]; reponseGenerique: string };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Associe une question à un scénario : question exacte, sinon meilleur score de mots-clés. */
export function choisirScenario(question: string, scenarios: ScenarioAssistant[]) {
  const q = norm(question);
  const exact = scenarios.find((s) => norm(s.question) === q);
  if (exact) return exact;
  let meilleur: ScenarioAssistant | undefined;
  let score = 0;
  for (const s of scenarios) {
    const sc = s.declencheurs.reduce((a, d) => a + (q.includes(norm(d)) ? 1 : 0), 0);
    if (sc > score) {
      score = sc;
      meilleur = s;
    }
  }
  return meilleur;
}

/**
 * Assistant SCRIPTÉ (aucun appel réseau) : indicateur « réfléchit… », écriture progressive
 * mot à mot, puis carte de résultat d'outil. TODO(module C) : remplacer par useChat() + /api/ia/assistant.
 */
export function useScriptedAssistant(data: DonneesAssistant) {
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [reflechit, setReflechit] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const compteur = useRef(0);
  const nouvelId = () => `m-${++compteur.current}`;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const ecrire = useCallback((texte: string, resultat?: ResultatOutil, apres?: () => void) => {
    const id = nouvelId();
    const mots = texte.split(" ");
    setMessages((m) => [...m, { id, role: "assistant", texte: "", enCours: true }]);
    mots.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          const fini = i === mots.length - 1;
          setMessages((m) => m.map((x) => (x.id === id ? { ...x, texte: mots.slice(0, i + 1).join(" "), enCours: !fini, resultat: fini ? resultat : undefined } : x)));
          if (fini) apres?.();
        }, 28 * i),
      );
    });
  }, []);

  const envoyer = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q || reflechit) return;
      setMessages((m) => [...m, { id: nouvelId(), role: "user", texte: q }]);
      setReflechit(true);
      timers.current.push(
        setTimeout(() => {
          setReflechit(false);
          const s = choisirScenario(q, data.scenarios);
          if (!s) return ecrire(data.reponseGenerique);
          ecrire(s.reponse, s.resultat, s.suite ? () => timers.current.push(setTimeout(() => ecrire(s.suite!), 450)) : undefined);
        }, 850),
      );
    },
    [data, ecrire, reflechit],
  );

  const resoudre = useCallback(
    (id: string, decision: "confirme" | "annule") => {
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, resolu: decision } : x)));
      timers.current.push(
        setTimeout(
          () => ecrire(decision === "confirme" ? "C'est fait : vos 2 kg de Deglet Nour Extra sont dans le panier. Autre chose ?" : "Entendu, je n'ajoute rien. Puis-je vous aider autrement ?"),
          300,
        ),
      );
    },
    [ecrire],
  );

  const reinitialiser = () => {
    timers.current.forEach(clearTimeout);
    setMessages([]);
    setReflechit(false);
  };

  return { messages, reflechit, envoyer, resoudre, reinitialiser };
}
