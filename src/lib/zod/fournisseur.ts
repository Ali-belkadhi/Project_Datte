import { z } from "zod";
import { GOUVERNORATS } from "@/types/enums";

export const TypeFournisseurEnum = z.enum(["PRODUCTEUR", "COOPERATIVE", "REVENDEUR", "TRANSFORMATEUR"]);

export const OnboardingStep1Schema = z.object({
  nomBoutique: z.string().trim().min(3).max(60),
  slug: z.string().trim().min(3).max(60).regex(/^[a-z0-9-]+$/).optional(),
  type: TypeFournisseurEnum,
  region: z.enum(GOUVERNORATS as unknown as [string, ...string[]]),
  adresseExploitation: z.string().trim().min(3).max(200),
  description: z.string().trim().max(1000).optional(),
  matriculeFiscal: z.string().trim().max(40).optional(),
  numeroRNE: z.string().trim().max(40).optional(),
});

export const RibSchema = z.object({
  rib: z.string().trim().regex(/^\d{20}$/, "Le RIB doit comporter 20 chiffres."),
});

export const ShopEditSchema = z.object({
  description: z.string().trim().max(1000).optional(),
});

export const AdminDecisionSchema = z.object({
  fournisseurId: z.string().min(1),
  motif: z.string().trim().min(10).max(500).optional(),
});

export const AdminRefuseSchema = AdminDecisionSchema.extend({
  motif: z.string().trim().min(10, "Indiquez un motif (10 caractères minimum).").max(500),
});

export const AdminSuspendSchema = AdminDecisionSchema.extend({
  motif: z.string().trim().min(10, "Indiquez un motif (10 caractères minimum).").max(500),
});