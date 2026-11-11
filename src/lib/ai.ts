// Socle IA commun (cahier des charges §12.1) — UN SEUL point de configuration du modèle.
// Changer de modèle ou de fournisseur = changer .env.local, jamais le code.
//  - GOOGLE_GENERATIVE_AI_API_KEY → Gemini en direct (@ai-sdk/google), AI_MODEL ex. "gemini-3.5-flash"
//  - sinon AI_GATEWAY_API_KEY     → Vercel AI Gateway, AI_MODEL ex. "anthropic/claude-sonnet-5-5"
// Clés lues uniquement côté serveur.
import "server-only";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

const GEMINI_PAR_DEFAUT = "gemini-3.5-flash";
const GATEWAY_PAR_DEFAUT = "anthropic/claude-sonnet-5-5";

export type FournisseurIA = "google" | "gateway" | null;

export function fournisseurIA(): FournisseurIA {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "google";
  if (process.env.AI_GATEWAY_API_KEY) return "gateway";
  return null;
}

/** Vrai si une clé est configurée ; sinon les fonctionnalités IA passent en mode dégradé. */
export const iaDisponible = () => fournisseurIA() !== null;

/** Modèle à passer aux fonctions du SDK (generateText, streamText…). */
export function modeleIA(): LanguageModel {
  const nom = process.env.AI_MODEL?.trim();
  switch (fournisseurIA()) {
    case "google":
      return google(nom?.replace(/^google\//, "") || GEMINI_PAR_DEFAUT);
    case "gateway":
      return nom || GATEWAY_PAR_DEFAUT;
    default:
      throw new Error("Aucune clé IA : définissez GOOGLE_GENERATIVE_AI_API_KEY ou AI_GATEWAY_API_KEY dans .env.local.");
  }
}
