// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import { getSession } from "@/server/core/session";
import { utilisateurRepository } from "../repositories";

export async function getUtilisateurCourant() {
  const { utilisateur } = await getSession();
  return utilisateur;
}

export async function getAdresses() {
  const u = await getUtilisateurCourant();
  return utilisateurRepository.adresses(u.id);
}

export async function getAdresseParDefaut() {
  const adresses = await getAdresses();
  return adresses.find((a) => a.parDefaut) ?? adresses[0] ?? null;
}
