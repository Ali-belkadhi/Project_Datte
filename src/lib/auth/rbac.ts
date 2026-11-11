import "server-only";
import { auth } from "@/auth";
import { connectMongoose } from "@/server/db/mongoose";
import { User } from "@/server/models";
import { AuthError } from "./errors";
import type { CurrentUser } from "./types";

export async function getUtilisateurCourant(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user?.id) throw new AuthError("UNAUTHENTICATED");
  await connectMongoose();
  const u = await User.findById(session.user.id);
  if (!u) throw new AuthError("UNAUTHENTICATED");
  if (u.statut !== "ACTIF") throw new AuthError("UNAUTHENTICATED");
  const sessionTokenVersion = (session.user as { tokenVersion?: number }).tokenVersion;
  if (typeof sessionTokenVersion === "number" && u.tokenVersion !== sessionTokenVersion) {
    throw new AuthError("UNAUTHENTICATED");
  }
  return {
    id: String(u._id),
    email: u.email,
    nom: u.nom,
    prenom: u.prenom,
    role: u.role,
    langue: u.langue,
    tokenVersion: u.tokenVersion,
    statut: u.statut,
    emailVerifie: u.emailVerifie,
  };
}

export async function requireRole(...roles: ("CLIENT" | "FOURNISSEUR" | "ADMIN")[]) {
  const u = await getUtilisateurCourant();
  if (u.role !== "ADMIN" && !roles.includes(u.role)) {
    throw new AuthError("FORBIDDEN");
  }
  return u;
}