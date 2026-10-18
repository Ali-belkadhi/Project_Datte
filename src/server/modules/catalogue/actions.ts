"use server";
// MODULE B — Catalogue (Ali Belkathi) — points d'entrée des mutations

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { initierPaiement } from "@/server/contracts/commandes";
import { notifier } from "@/server/contracts/comptes";
import {
  achatCreditsSchema,
  favoriSchema,
  generation3DSchema,
  produitIdSchema,
  produitSchema,
  publierModeleSchema,
  reordonnerPhotosSchema,
  varieteSchema,
} from "@/lib/validation/catalogue";
import { listPacksCredits } from "./services/credits";
import { coutGeneration } from "./services/modeles3d";

export async function creerProduit(input: unknown) {
  return runAction(produitSchema, input, ["FOURNISSEUR"], async (d) => {
    // TODO(module B) : produitService.creer(d) (Produit + ProduitDatte | ProduitDerive + OptionPoids)
    revalidatePath("/vendeur/produits");
    return { id: "demo-" + d.nom.toLowerCase().replace(/\s+/g, "-") };
  });
}

export async function majProduit(input: unknown) {
  return runAction(produitSchema, input, ["FOURNISSEUR"], async (d) => {
    revalidatePath("/vendeur/produits");
    return { id: "demo-" + d.nom.toLowerCase().replace(/\s+/g, "-") };
  });
}

export async function publierProduit(input: unknown) {
  return runAction(produitIdSchema, input, ["FOURNISSEUR"], async (d) => ({ id: d.produitId, statut: "PUBLIE" as const }), "Produit publié (démo)");
}

export async function archiverProduit(input: unknown) {
  return runAction(produitIdSchema, input, ["FOURNISSEUR"], async (d) => ({ id: d.produitId, statut: "ARCHIVE" as const }), "Produit archivé (démo)");
}

export async function reordonnerPhotos(input: unknown) {
  return runAction(reordonnerPhotosSchema, input, ["FOURNISSEUR"], async (d) => ({ ordre: d.ordre }));
}

/** Réserve les crédits, crée la tâche Meshy (integrations/meshy), statut EN_COURS. */
export async function lancerGeneration3D(input: unknown) {
  return runAction(generation3DSchema, input, ["FOURNISSEUR"], async (d) => {
    // TODO(module B) : MouvementCredit3D(RESERVATION) + meshy.creerTache({ imageUrls }) + Modele3D
    return { modeleId: "m3d-demo", credits: coutGeneration(d.photoIds.length) };
  }, "Génération lancée (démo)");
}

export async function publierModele3D(input: unknown) {
  return runAction(publierModeleSchema, input, ["FOURNISSEUR"], async (d) => {
    revalidatePath("/vendeur/studio-3d");
    return { id: d.modeleId };
  }, "Modèle publié sur la fiche produit (démo)");
}

export async function acheterCredits3D(input: unknown) {
  return runAction(achatCreditsSchema, input, ["FOURNISSEUR"], async (d) => {
    const pack = (await listPacksCredits()).find((p) => p.id === d.packId);
    // Contrat du module C : paiement (Konnect / Flouci) — simulé
    const paiement = await initierPaiement(pack?.prix ?? 0, { type: "CREDITS_3D", reference: d.packId });
    await notifier("u-hedi", "ACHAT_CREDITS_CONFIRME", { pack: d.packId });
    return { credits: pack?.nombreCredits ?? 0, paiement };
  }, "Crédits ajoutés (démo)");
}

export async function basculerFavori(input: unknown) {
  return runAction(favoriSchema, input, ["CLIENT"], async (d) => ({ produitId: d.produitId }), "Favoris mis à jour");
}

export async function creerVariete(input: unknown) {
  return runAction(varieteSchema, input, ["ADMIN"], async (d) => {
    revalidatePath("/admin/varietes");
    return { slug: d.slug };
  });
}
