import { z } from "zod";

export const ParametresPatchSchema = z.object({
  tauxCommission: z.number().min(0).max(0.5).optional(),
  fraisLivraisonDefaut: z.number().int().min(0).optional(),
  livraisonGratuiteDes: z.number().int().min(0).nullable().optional(),
  creditsOffertsInscription: z.number().int().min(0).optional(),
  coutCreditsImage: z.number().int().min(1).optional(),
  coutCreditsMultiImage: z.number().int().min(1).optional(),
  seuilCreditsBas: z.number().int().min(0).optional(),
  delaiMax3DMinutes: z.number().int().min(1).optional(),
});