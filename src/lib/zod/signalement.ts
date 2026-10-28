import { z } from "zod";

export const MotifSignalementEnum = z.enum(["INAPPROPRIE", "FRAUDE", "SPAM", "NON_CONFORME", "AUTRE"]);
export const CibleSignalementEnum = z.enum(["PRODUIT", "AVIS", "FOURNISSEUR", "MESSAGE"]);

export const CreerSignalementSchema = z.object({
  cibleType: CibleSignalementEnum,
  cibleId: z.string().min(1),
  motif: MotifSignalementEnum,
  texteLibre: z.string().trim().max(500).optional(),
});

export const TraiterSignalementSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["MASQUER", "REJETER", "TRAITE"]),
  note: z.string().trim().max(500).optional(),
});