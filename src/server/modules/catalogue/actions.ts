"use server";
// MODULE B — Catalogue (Ali Belkathi) — points d'entrée des mutations

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { initierPaiement } from "@/server/contracts/commandes";
import { notifier } from "@/server/contracts/comptes";
import {
  achatCreditsSchema,
  categorieDeriveIdSchema,
  categorieDeriveMajSchema,
  categorieDeriveSchema,
  favoriSchema,
  generation3DSchema,
  packCreditsAdminSchema,
  packCreditsIdSchema,
  packCreditsMajSchema,
  produitIdSchema,
  produitMajSchema,
  produitSchema,
  publierModeleSchema,
  reordonnerPhotosSchema,
  varieteMajSchema,
  varieteSchema,
  varieteSlugSchema,
  type ProduitInput,
} from "@/lib/validation/catalogue";
import { creerTache } from "@/server/integrations/meshy/client";
import {
  categorieDeriveRepository,
  creditsRepository,
  favoriRepository,
  modele3DRepository,
  produitRepository,
  varieteRepository,
} from "./repositories";
import { listPacksCredits } from "./services/credits";
import { coutGeneration } from "./services/modeles3d";
import { creerMonProduit, majMonProduit, supprimerMonProduit } from "./services/produits";

export async function creerProduit(input: unknown) {
  return runAction(
    produitSchema,
    input,
    ["FOURNISSEUR"],
    async (d) => {
      const p = await creerMonProduit(d);
      revalidateCatalogue();
      return { id: p.id, slug: p.slug };
    },
    "Produit enregistré",
  );
}

export async function majProduit(input: unknown) {
  return runAction(
    produitMajSchema,
    input,
    ["FOURNISSEUR"],
    async ({ id, ...d }) => {
      const p = await majMonProduit(id, d as ProduitInput);
      revalidateCatalogue();
      return { id: p.id, slug: p.slug };
    },
    "Modifications enregistrées",
  );
}

export async function supprimerProduit(input: unknown) {
  return runAction(
    produitIdSchema,
    input,
    ["FOURNISSEUR"],
    async (d) => {
      await supprimerMonProduit(d.produitId);
      revalidateCatalogue();
      return { id: d.produitId };
    },
    "Produit supprimé",
  );
}

/** Invalide les pages qui affichent des produits (espace fournisseur + catalogue client). */
function revalidateCatalogue() {
  revalidatePath("/fournisseur/produits");
  revalidatePath("/vendeur/produits");
  revalidatePath("/catalogue");
  revalidatePath("/produit/[slug]", "page");
  revalidatePath("/");
}

export async function reordonnerPhotos(input: unknown) {
  return runAction(reordonnerPhotosSchema, input, ["FOURNISSEUR"], async (d) => ({ ordre: d.ordre }));
}

/** Réserve les crédits, crée la tâche Meshy, et enregistre le Modele3D en base (statut EN_COURS). */
export async function lancerGeneration3D(input: unknown) {
  return runAction(
    generation3DSchema,
    input,
    ["FOURNISSEUR"],
    async (d) => {
      const cout = coutGeneration(d.photoIds.length);
      const fournisseurId = "fournisseur-001";

      const p = await produitRepository.parId(d.produitId);
      const nom = p?.nom || "Produit";

      // 1. Débit / réservation sécurisée des crédits
      const reserve = await creditsRepository.reserver(
        fournisseurId,
        cout,
        `Réservation génération 3D : « ${nom} »`,
      );

      if (!reserve) {
        throw new Error("Solde de crédits insuffisant pour lancer la génération 3D.");
      }

      // 2. Création de la tâche Meshy / fallback
      const imageUrls = p && "images" in p && Array.isArray(p.images) && p.images.length
        ? (p.images as string[])
        : ["/images/degla1.webp"];

      const tache = await creerTache({ imageUrls, mode: d.photoIds.length > 1 ? "MULTI_IMAGE" : "IMAGE" });

      // 3. Enregistrement du modèle en MongoDB
      const nouveauModele = await modele3DRepository.creer({
        produitId: d.produitId,
        produitNom: nom,
        fournisseurId,
        statut: "EN_COURS",
        progression: 25,
        creditsConsommes: cout,
        taskId: tache.id,
      });

      revalidatePath("/vendeur/studio-3d");
      revalidatePath("/vendeur/credits");

      return { modeleId: nouveauModele.id, credits: cout, taskId: tache.id };
    },
    "Génération 3D lancée avec succès",
  );
}

export async function publierModele3D(input: unknown) {
  return runAction(
    publierModeleSchema,
    input,
    ["FOURNISSEUR"],
    async (d) => {
      const m = await modele3DRepository.parId(d.modeleId);
      if (m) {
        await modele3DRepository.maj(d.modeleId, { statut: "PUBLIE" });
        if (m.source && m.source.kind === "glb") {
          await produitRepository.maj(m.produitId, { modelUrl: m.source.url } as never, "fournisseur-001");
        }
      }
      revalidatePath("/vendeur/studio-3d");
      revalidateCatalogue();
      return { id: d.modeleId };
    },
    "Modèle 3D publié sur la fiche produit",
  );
}

export async function acheterCredits3D(input: unknown) {
  return runAction(
    achatCreditsSchema,
    input,
    ["FOURNISSEUR"],
    async (d) => {
      const packs = await creditsRepository.packs();
      const pack = packs.find((p) => p.id === d.packId);
      const credits = pack?.nombreCredits ?? 5;
      const fournisseurId = "fournisseur-001";

      await creditsRepository.crediter(
        fournisseurId,
        credits,
        `Achat pack ${pack?.nom || "Crédits"} (${credits} crédits)`,
      );

      const paiement = await initierPaiement(pack?.prix ?? 0, { type: "CREDITS_3D", reference: d.packId });
      await notifier("u-hedi", "ACHAT_CREDITS_CONFIRME", { pack: d.packId });

      revalidatePath("/vendeur/credits");
      revalidatePath("/vendeur/studio-3d");

      return { credits, paiement };
    },
    "Crédits ajoutés à votre compte",
  );
}

export async function basculerFavori(input: unknown) {
  return runAction(
    favoriSchema,
    input,
    ["CLIENT"],
    async (d) => {
      const ajoute = await favoriRepository.basculer("u-acheteur-demo", d.produitId);
      revalidatePath("/compte/favoris");
      return { produitId: d.produitId, ajoute };
    },
    "Favoris mis à jour",
  );
}

/* ------------------------------- Admin CRUD ------------------------------- */

export async function creerVariete(input: unknown) {
  return runAction(varieteSchema, input, ["ADMIN"], async (d) => {
    const v = await varieteRepository.creer(d);
    revalidatePath("/admin/varietes");
    revalidatePath("/catalogue");
    revalidatePath("/varietes");
    return { slug: v.slug };
  }, "Variété ajoutée");
}

export async function majVariete(input: unknown) {
  return runAction(varieteMajSchema, input, ["ADMIN"], async ({ slug, ...d }) => {
    const v = await varieteRepository.maj(slug, d);
    revalidatePath("/admin/varietes");
    revalidatePath("/catalogue");
    revalidatePath("/varietes");
    return { slug: v?.slug ?? slug };
  }, "Variété mise à jour");
}

export async function supprimerVariete(input: unknown) {
  return runAction(varieteSlugSchema, input, ["ADMIN"], async (d) => {
    await varieteRepository.supprimer(d.slug);
    revalidatePath("/admin/varietes");
    revalidatePath("/catalogue");
    revalidatePath("/varietes");
    return { slug: d.slug };
  }, "Variété supprimée");
}

export async function creerCategorieDerive(input: unknown) {
  return runAction(categorieDeriveSchema, input, ["ADMIN"], async (d) => {
    const c = await categorieDeriveRepository.creer(d);
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    return { id: c.id };
  }, "Catégorie créée");
}

export async function majCategorieDerive(input: unknown) {
  return runAction(categorieDeriveMajSchema, input, ["ADMIN"], async ({ id, ...d }) => {
    const c = await categorieDeriveRepository.maj(id, d);
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    return { id: c?.id ?? id };
  }, "Catégorie mise à jour");
}

export async function supprimerCategorieDerive(input: unknown) {
  return runAction(categorieDeriveIdSchema, input, ["ADMIN"], async (d) => {
    await categorieDeriveRepository.supprimer(d.id);
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    return { id: d.id };
  }, "Catégorie supprimée");
}

export async function creerPackCredits(input: unknown) {
  return runAction(packCreditsAdminSchema, input, ["ADMIN"], async (d) => {
    const p = await creditsRepository.creerPack({
      nom: d.nom,
      nombreCredits: d.nombreCredits,
      prix: d.prix,
      description: d.description || "",
      misEnAvant: d.misEnAvant || false,
    });
    revalidatePath("/admin/packs");
    revalidatePath("/vendeur/credits");
    return { id: p.id };
  }, "Pack de crédits créé");
}

export async function majPackCredits(input: unknown) {
  return runAction(packCreditsMajSchema, input, ["ADMIN"], async ({ id, ...d }) => {
    const p = await creditsRepository.majPack(id, d);
    revalidatePath("/admin/packs");
    revalidatePath("/vendeur/credits");
    return { id: p?.id ?? id };
  }, "Pack de crédits mis à jour");
}

export async function supprimerPackCredits(input: unknown) {
  return runAction(packCreditsIdSchema, input, ["ADMIN"], async (d) => {
    await creditsRepository.supprimerPack(d.id);
    revalidatePath("/admin/packs");
    revalidatePath("/vendeur/credits");
    return { id: d.id };
  }, "Pack de crédits supprimé");
}
