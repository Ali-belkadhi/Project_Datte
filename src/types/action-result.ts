/** Résultat standard de toutes les Server Actions (lu par le client et le serveur). */
export type ActionErrorCode = "VALIDATION" | "FORBIDDEN" | "NOT_FOUND" | "NOT_IMPLEMENTED" | "INTERNE";

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: { code: ActionErrorCode; message: string; details?: unknown } };
