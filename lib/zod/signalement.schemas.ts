/**
 * Module A - Zod Validation Schemas for Signalement & Paramètres
 */

import { z } from 'zod';
import { CibleSignalement, StatutTraitement } from '@/domain/enums';

// ===== SIGNALEMENT =====
export const signalementSchema = z.object({
  cibleType: z.nativeEnum(CibleSignalement),
  cibleId: z.string().min(1, 'Cible requise'),
  motif: z.string().min(10, 'Minimum 10 caractères').max(1000).trim(),
});

export type SignalementInput = z.infer<typeof signalementSchema>;

// ===== TRAITEMENT SIGNALEMENT (admin) =====
export const traiterSignalementSchema = z.object({
  signalementId: z.string().min(1),
  statut: z.enum([StatutTraitement.TRAITE, StatutTraitement.REJETE]),
  motif: z.string().max(500).trim().optional(),
});

export type TraiterSignalementInput = z.infer<typeof traiterSignalementSchema>;

// ===== PARAMÈTRES PLATEFORME (EF-54) =====
export const parametresPlateformeSchema = z.object({
  tauxCommission: z.coerce.number().min(0).max(1),
  fraisLivraisonDefaut: z.coerce.number().min(0),
  livraisonGratuiteDes: z.coerce.number().min(0).optional(),
  creditsOffertsInscription: z.coerce.number().min(0),
  coutCreditsImage: z.coerce.number().min(1),
  coutCreditsMultiImage: z.coerce.number().min(1),
  seuilCreditsBas: z.coerce.number().min(0),
  delaiMax3DMinutes: z.coerce.number().min(1),
});

export type ParametresPlateformeInput = z.infer<typeof parametresPlateformeSchema>;
