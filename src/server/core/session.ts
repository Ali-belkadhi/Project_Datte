import "server-only";
import { cookies, headers } from "next/headers";
import type { Session, Utilisateur } from "@/types/domain";
import type { ZoneDemo } from "@/types/enums";
import { utilisateurRepository } from "@/server/modules/comptes/repositories";

export const ZONE_HEADER = "x-degla-zone";
export const VIEW_COOKIE = "degla-demo-view";

/**
 * Zone de l'application : posée par `src/proxy.ts` (en-tête) selon le chemin,
 * ou forcée par le DevViewSwitcher (cookie). L'en-tête est prioritaire.
 */
export async function getZone(): Promise<ZoneDemo> {
  const h = await headers();
  const fromHeader = h.get(ZONE_HEADER);
  if (fromHeader === "vendeur" || fromHeader === "admin" || fromHeader === "acheteur") return fromHeader;
  const c = await cookies();
  const fromCookie = c.get(VIEW_COOKIE)?.value;
  if (fromCookie === "vendeur" || fromCookie === "admin") return fromCookie;
  return "acheteur";
}

/**
 * Session FACTICE : renvoie l'utilisateur de démo de la zone courante.
 * TODO(module A) : remplacer par `auth()` d'Auth.js — la signature reste la même.
 */
export async function getSession(): Promise<Session> {
  const zone = await getZone();
  const utilisateur: Utilisateur = await utilisateurRepository.demoPourZone(zone);
  return { utilisateur, demo: true };
}
