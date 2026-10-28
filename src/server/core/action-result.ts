import "server-only";
/**
 * Résultat standard de toutes les Server Actions.
 * Le client lit `ok` puis `data` ou `error` — jamais d'exception à travers la frontière.
 */

import type { ActionErrorCode, ActionResult } from "@/types/action-result";

export type { ActionErrorCode, ActionResult };

const MESSAGES: Record<ActionErrorCode, string> = {
  VALIDATION: "Certains champs sont à corriger.",
  FORBIDDEN: "Vous n'avez pas les droits pour cette action.",
  NOT_FOUND: "Élément introuvable.",
  NOT_IMPLEMENTED: "Fonctionnalité pas encore disponible.",
  INTERNE: "Une erreur inattendue est survenue.",
};

export function ok<T>(data: T, message = "Enregistré."): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(code: ActionErrorCode, details?: unknown, message?: string): ActionResult<never> {
  return { ok: false, error: { code, message: message ?? MESSAGES[code], details } };
}
