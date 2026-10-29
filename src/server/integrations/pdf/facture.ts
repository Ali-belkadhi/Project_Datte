// MODULE C — génération des factures PDF. Stub typé.
import "server-only";
import { NonImplementeError } from "@/server/core/errors";

export async function genererFacture(_: { numero: string; commandeNumero: string }): Promise<Uint8Array> {
  throw new NonImplementeError("pdf.genererFacture");
}
