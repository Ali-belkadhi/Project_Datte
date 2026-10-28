"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type EtapeFlux<K extends string> = { champ: K; valeur: string; mots?: boolean };

/**
 * Simule un flux de sortie d'IA (IA-B) : remplit les champs UN PAR UN,
 * la description s'écrit mot par mot (~3 s). Aucun appel réseau.
 * TODO(module B) : remplacer par useObject() / streamText côté app/api/ia/fiche-produit.
 */
export function useFakeStream<K extends string>(onChamp: (champ: K, valeur: string, fini: boolean) => void) {
  const [etat, setEtat] = useState<"inactif" | "analyse" | "flux" | "termine">("inactif");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cb = useRef(onChamp);
  useEffect(() => {
    cb.current = onChamp;
  }, [onChamp]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const lancer = useCallback((etapes: EtapeFlux<K>[], analyseMs = 1600) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setEtat("analyse");
    let t = analyseMs;
    const planifier = (fn: () => void, delai: number) => timers.current.push(setTimeout(fn, delai));
    planifier(() => setEtat("flux"), t);
    for (const e of etapes) {
      if (e.mots) {
        const mots = e.valeur.split(" ");
        const pas = Math.max(25, Math.round(3000 / mots.length));
        mots.forEach((_, i) => {
          t += pas;
          const fini = i === mots.length - 1;
          planifier(() => cb.current(e.champ, mots.slice(0, i + 1).join(" "), fini), t);
        });
      } else {
        t += 420;
        planifier(() => cb.current(e.champ, e.valeur, true), t);
      }
    }
    planifier(() => setEtat("termine"), t + 200);
  }, []);

  return { etat, lancer, actif: etat === "analyse" || etat === "flux" };
}
