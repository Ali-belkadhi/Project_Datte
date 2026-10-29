import "server-only";
import type { Role } from "@/types/enums";
import { ForbiddenError } from "./errors";
import { getSession } from "./session";

/**
 * Vérifie le rôle de l'utilisateur courant et le renvoie.
 * Lève `ForbiddenError` si le rôle ne correspond pas.
 * L'ADMIN passe partout (super-utilisateur).
 */
export async function requireRole(...roles: Role[]) {
  const { utilisateur } = await getSession();
  if (utilisateur.role !== "ADMIN" && !roles.includes(utilisateur.role)) {
    throw new ForbiddenError(`Rôle requis : ${roles.join(" ou ")} (actuel : ${utilisateur.role}).`);
  }
  return utilisateur;
}
