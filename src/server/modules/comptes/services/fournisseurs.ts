// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import * as FS from "@/server/services/FournisseurService";
import { getUtilisateurCourant } from "@/lib/auth/rbac";
import { fournisseurRepositoryMock } from "../repositories/fournisseur.repository.mock";
import { toFournisseurDoc } from "../mappers";

export type ListeFournisseurs = {
  items: ReturnType<typeof toFournisseurDoc>[];
  total: number;
  page: number;
  limit: number;
};

export async function listFournisseurs(statutOrOpts?: string | { statut?: string; q?: string; page?: number; limit?: number }): Promise<ListeFournisseurs> {
  const opts = typeof statutOrOpts === "string" ? { statut: statutOrOpts } : (statutOrOpts ?? {});
  const res = await FS.listFournisseurs(opts);
  return {
    items: res.items.map((d) => toFournisseurDoc(d)),
    total: res.total,
    page: res.page,
    limit: res.limit,
  };
}

export async function getFournisseur(id: string) {
  // Les fiches de catalogue non persistées utilisent des identifiants lisibles (ex. « f-ben-amor ») : repli sur le référentiel de vitrine.
  if (!/^[a-f0-9]{24}$/i.test(id)) return fournisseurRepositoryMock.parId(id);
  const doc = await FS.getFournisseur(id);
  return doc ? toFournisseurDoc(doc) : null;
}

export async function getFournisseurParSlug(slug: string) {
  const doc = await FS.getFournisseurBySlug(slug);
  return doc ? toFournisseurDoc(doc) : await fournisseurRepositoryMock.parSlug(slug);
}

export async function estFournisseurVerifie(id: string) {
  return FS.estFournisseurVerifie(id);
}

/** Boutiques vérifiées, triées par note (accueil, « Boutiques vérifiées »). */
export async function listBoutiquesVerifiees(limite = 4) {
  const res = await FS.listFournisseurs({ statut: "VERIFIE", limit: limite });
  return res.items
    .map((d) => toFournisseurDoc(d))
    .sort((a, b) => b.noteMoyenne - a.noteMoyenne)
    .slice(0, limite);
}

export async function getMaBoutique() {
  const u = await getUtilisateurCourant();
  const doc = await FS.getFournisseurByUser(u.id);
  if (!doc) throw new Error("Boutique introuvable pour cet utilisateur.");
  return toFournisseurDoc(doc);
}

/** Vue admin : boutique + documents + dernière analyse IA. */
export async function getDossierFournisseur(id: string) {
  return FS.getFournisseur(id);
}

export async function getAnalyseDocuments(id: string) {
  return FS.getAnalyseDocuments(id);
}
