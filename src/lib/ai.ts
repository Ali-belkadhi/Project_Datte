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

export type FournisseurIA = "google" | "openrouter" | "gateway" | null;

export function fournisseurIA(): FournisseurIA {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "google";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.AI_GATEWAY_API_KEY) return "gateway";
  return null;
}

/** Vrai si une clé est configurée ; sinon l'assistant IA-C passe en mode local. */
export const iaDisponible = () => fournisseurIA() !== null;

/** Modèle à passer aux fonctions du Vercel AI SDK (streamText, generateText…). */
export function modeleIA(): LanguageModel {
  const nom = process.env.AI_MODEL?.trim();
  switch (fournisseurIA()) {
    case "google":
      return google(nom?.replace(/^google\//, "") || GEMINI_PAR_DEFAUT);
    case "openrouter": {
      const { apiKey, headers } = { apiKey: process.env.OPENROUTER_API_KEY!, headers: { "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000", "X-Title": "DEGLA" } };
      const openrouter = createOpenAICompatible({ name: "openrouter", baseURL: OPENROUTER_BASE_URL, apiKey, headers });
      return openrouter.chatModel(process.env.OPENROUTER_MODEL?.trim() || OPENROUTER_PAR_DEFAUT);
    }
    case "gateway":
      return nom || GATEWAY_PAR_DEFAUT;
    default:
      throw new Error("Aucune clé IA : définissez GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY ou AI_GATEWAY_API_KEY dans .env.local.");
  }
}
