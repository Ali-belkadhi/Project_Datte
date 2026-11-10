"use server";

import { revalidatePath } from "next/cache";
import { associateProductLotSchema, registerConfirmedLotSchema } from "../application/validation";
import { associateProductToLot, registerConfirmedLot } from "../application/traceability.service";
import { runAction } from "@/server/core/action";
import { ForbiddenError, NotFoundError } from "@/server/core/errors";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { getMaBoutique } from "@/server/modules/comptes/services/fournisseurs";
import { getMonProduit } from "@/server/modules/catalogue/services/produits";

async function verifiedSupplier() {
  const [user, shop] = await Promise.all([getUtilisateurCourant(), getMaBoutique()]);
  if (!user.fournisseurId) throw new NotFoundError("profil fournisseur");
  if (!shop.verifie) throw new ForbiddenError("Votre dossier fournisseur doit être vérifié avant une écriture Blockchain.");
  return { user, shop, supplierId: user.fournisseurId };
}

export async function saveConfirmedLot(input: unknown) {
  return runAction(registerConfirmedLotSchema, input, ["FOURNISSEUR"], async (data) => {
    const { shop, supplierId } = await verifiedSupplier();
    if (shop.type !== "PRODUCTEUR" && shop.type !== "COOPERATIVE") {
      throw new ForbiddenError("Seuls les producteurs et coopératives peuvent enregistrer un lot agricole.");
    }
    const lot = await registerConfirmedLot({ ...data, supplierId });
    revalidatePath("/fournisseur/tracabilite");
    return lot;
  }, "Lot confirmé et enregistré dans DEGLA");
}

export async function linkProductToLot(input: unknown) {
  return runAction(associateProductLotSchema, input, ["FOURNISSEUR"], async (data) => {
    const { supplierId } = await verifiedSupplier();
    const product = await getMonProduit(data.productId);
    if (!product) throw new NotFoundError("produit");
    const link = await associateProductToLot({ ...data, supplierId });
    revalidatePath("/fournisseur/tracabilite");
    revalidatePath(`/produit/${product.slug}`);
    revalidatePath(`/tracabilite/${product.id}`);
    return link;
  }, "Produit associé au lot Blockchain");
}
