// Socle IA commun (cahier des charges §12.1) — configuration des modèles, lue depuis l'environnement.
// Clés lues uniquement côté serveur (fichier importé seulement par du code serveur). Changer de modèle = changer .env.local, jamais le code.
//
//  - IA-A / IA-B (modules A et B) : OpenRouter en HTTP direct → getOpenRouterConfig()
//  - IA-C (module C, Vercel AI SDK) : modeleIA(), par ordre de priorité :
//      1. GOOGLE_GENERATIVE_AI_API_KEY → Gemini en direct (@ai-sdk/google), AI_MODEL ex. "gemini-3.5-flash"
//      2. OPENROUTER_API_KEY           → OpenRouter (API compatible OpenAI), OPENROUTER_MODEL
//      3. AI_GATEWAY_API_KEY           → Vercel AI Gateway, AI_MODEL ex. "anthropic/claude-sonnet-5-5"
import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not defined");
  if (!model) throw new Error("OPENROUTER_MODEL is not defined");
  return {
    apiKey,
    model,
    baseUrl: OPENROUTER_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "DEGLA",
    },
  };
}

const GEMINI_PAR_DEFAUT = "gemini-3.5-flash";
const OPENROUTER_PAR_DEFAUT = "google/gemini-2.5-flash";
const GATEWAY_PAR_DEFAUT = "anthropic/claude-sonnet-5-5";

export type FournisseurIA = "google" | "openrouter" | "gateway";
export type ModeleConfigure = { fournisseur: FournisseurIA; nom: string; modele: LanguageModel };

/**
 * Modèles configurés, par ordre de priorité : chaque clé présente ajoute un modèle.
 * L'assistant IA-C essaie le suivant si un modèle échoue (quota gratuit Gemini dépassé, panne…).
 */
export function modelesIA(): ModeleConfigure[] {
  const nom = process.env.AI_MODEL?.trim();
  const liste: ModeleConfigure[] = [];
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const n = nom?.replace(/^google\//, "") || GEMINI_PAR_DEFAUT;
    liste.push({ fournisseur: "google", nom: n, modele: google(n) });
  }
  if (process.env.OPENROUTER_API_KEY) {
    const n = process.env.OPENROUTER_MODEL?.trim() || OPENROUTER_PAR_DEFAUT;
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: OPENROUTER_BASE_URL,
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: { "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000", "X-Title": "DEGLA" },
    });
    liste.push({ fournisseur: "openrouter", nom: n, modele: openrouter.chatModel(n) });
  }
  if (process.env.AI_GATEWAY_API_KEY) {
    const n = nom && nom.includes("/") ? nom : GATEWAY_PAR_DEFAUT;
    liste.push({ fournisseur: "gateway", nom: n, modele: n });
  }
  return liste;
}

/** Vrai si une clé est configurée ; sinon l'assistant IA-C passe en mode local. */
export const iaDisponible = () => modelesIA().length > 0;

/** Premier modèle configuré (Vercel AI SDK : streamText, generateText…). */
export function modeleIA(): LanguageModel {
  const [premier] = modelesIA();
  if (!premier) throw new Error("Aucune clé IA : définissez GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY ou AI_GATEWAY_API_KEY dans .env.local.");
  return premier.modele;
}
