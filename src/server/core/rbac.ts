import "server-only";
import type { Role } from "@/types/enums";
import type { Utilisateur } from "@/types/domain";
import { ForbiddenError } from "./errors";
import { getUtilisateurCourant } from "@/lib/auth/rbac";
import { AuthError } from "@/lib/auth/errors";

export async function requireRole(...roles: Role[]): Promise<Utilisateur> {
  let u;
  try {
    u = await getUtilisateurCourant();
  } catch (e) {
    if (e instanceof AuthError) throw new ForbiddenError("Non authentifié.");
    throw e;
  }
  if (u.role !== "ADMIN" && !roles.includes(u.role as Role)) {
    throw new ForbiddenError(`Rôle requis : ${roles.join(" ou ")} (actuel : ${u.role}).`);
  }
  const utilisateur: Utilisateur = {
    id: u.id,
    prenom: u.prenom,
    nom: u.nom,
    email: u.email,
    role: u.role as Role,
    ville: "",
    initiales: (u.prenom[0] ?? "") + (u.nom[0] ?? ""),
    telephoneVerifie: false,
  };
  return utilisateur;
}