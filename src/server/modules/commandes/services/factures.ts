// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

/** Numéro de facture : FAC-AAAA-NNNNNN (dérivé du numéro de commande). */
export const numeroFacture = (numeroCommande: string) => numeroCommande.replace("DGL", "FAC");

/** TODO(module C) : integrations/pdf/facture.ts puis stockage R2. */
export async function genererFacturePdf(_numeroCommande: string): Promise<{ url: string }> {
  throw new NonImplementeError("factures.genererFacturePdf");
}
