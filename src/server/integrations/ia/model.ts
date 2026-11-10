// COMMUN — configuration du modèle d'IA générative (Vercel AI SDK). Stub.
import "server-only";
import { env } from "@/server/core/env";
import { NonImplementeError } from "@/server/core/errors";

/** Identifiant du modèle (AI Gateway), ex. "anthropic/claude-sonnet-5-5". Non utilisé dans le template. */
export const AI_MODEL = env.AI_MODEL;

/**
 * TODO(commun) : `npm i ai` puis
 *   import { gateway } from "ai";
 *   export const model = gateway(AI_MODEL);
 */
export function getModel(): never {
  throw new NonImplementeError("ia.getModel");
}
