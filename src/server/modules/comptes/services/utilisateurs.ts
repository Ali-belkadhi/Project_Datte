// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import { getUtilisateurCourant as getAuthUser } from "@/lib/auth/rbac";
import { connectMongoose } from "@/server/db/mongoose";
import { User, Fournisseur, Adresse as AdresseModel } from "@/server/models";
import { listAddresses } from "@/server/services/AddressService";
import { initialesDe } from "../mappers";
import type { Adresse, Utilisateur } from "@/types/domain";

export async function getUtilisateurCourant(): Promise<Utilisateur> {
  const session = await getAuthUser();
  await connectMongoose();
  const u = await User.findById(session.id);
  let fournisseurId: string | undefined;
  if (u?.role === "FOURNISSEUR") {
    const f = await Fournisseur.findOne({ userId: u._id }).select("_id");
    fournisseurId = f ? String(f._id) : undefined;
  }
  const adresse = await AdresseModel.findOne({ userId: session.id }).sort({ parDefaut: -1, createdAt: -1 }).select("ville gouvernorat");
  const ville = adresse?.ville ? `${adresse.ville}${adresse.gouvernorat ? `, ${adresse.gouvernorat}` : ""}` : "";
  return {
    id: session.id,
    prenom: u?.prenom ?? session.prenom,
    nom: u?.nom ?? session.nom,
    email: u?.email ?? session.email,
    telephone: u?.telephone ?? undefined,
    telephoneVerifie: Boolean(u?.telephoneVerifie),
    role: session.role,
    ville,
    initiales: initialesDe(u?.prenom ?? session.prenom, u?.nom ?? session.nom),
    fournisseurId,
  };
}

export async function getAdresses(): Promise<Adresse[]> {
  const u = await getAuthUser();
  return listAddresses(u.id);
}

export async function getAdresseParDefaut(): Promise<Adresse | null> {
  const adresses = await getAdresses();
  return adresses.find((a) => a.parDefaut) ?? adresses[0] ?? null;
}
