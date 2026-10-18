import "server-only";

/** Erreur levée par tout ce qui n'est pas encore implémenté (intégrations, Prisma…). */
export class NonImplementeError extends Error {
  readonly code = "NOT_IMPLEMENTED" as const;
  constructor(public readonly fonction: string) {
    super(`Non implémenté dans le template : ${fonction}`);
    this.name = "NonImplementeError";
  }
}

/** Rôle insuffisant pour l'action demandée. */
export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN" as const;
  constructor(message = "Accès refusé pour ce rôle.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Ressource introuvable. */
export class NotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;
  constructor(public readonly ressource: string) {
    super(`Introuvable : ${ressource}`);
    this.name = "NotFoundError";
  }
}

export type DeglaErrorCode = "NOT_IMPLEMENTED" | "FORBIDDEN" | "NOT_FOUND";
