// COMMUN — stockage Cloudflare R2 (photos produits, documents, GLB). Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

export type DossierStockage = "produits" | "documents" | "modeles-3d" | "avis" | "factures";

/** TODO(commun) : URL signée PUT (S3 compatible) — 5 min, taille et type contrôlés. */
export async function urlSigneeUpload(_: { dossier: DossierStockage; nomFichier: string; type: string }): Promise<{ url: string; cle: string }> {
  throw new NonImplementeError("r2.urlSigneeUpload");
}

export async function urlPublique(_cle: string): Promise<string> {
  throw new NonImplementeError("r2.urlPublique");
}
