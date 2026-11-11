import { z } from "zod";

export const lotIdSchema = z
  .string()
  .trim()
  .min(3, "L'identifiant du lot est requis.")
  .max(80, "L'identifiant du lot est trop long.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "Utilisez uniquement lettres, chiffres, points, tirets et underscores.");

export const transactionHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Hash de transaction invalide.");

export const registerConfirmedLotSchema = z.object({
  lotId: lotIdSchema,
  transactionHash: transactionHashSchema,
  walletSignature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, "Signature du wallet invalide."),
});

export const registerConfirmedStepSchema = registerConfirmedLotSchema;

export const associateProductLotSchema = z.object({
  productId: z.string().trim().min(1),
  lotId: lotIdSchema,
});

export const lookupLotSchema = z.object({ lotId: lotIdSchema });

export type RegisterConfirmedLotInput = z.infer<typeof registerConfirmedLotSchema>;
export type AssociateProductLotInput = z.infer<typeof associateProductLotSchema>;
