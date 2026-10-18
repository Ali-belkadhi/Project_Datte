'use server';

/**
 * Module A - OTP Server Actions (EF-02)
 */

import { getUtilisateurCourant } from '@/server/middleware/rbac';
import { OtpService } from '@/server/services/OtpService';
import { otpSchema } from '@/lib/zod/auth.schemas';

type ReponseAction = { success: boolean; error?: string; message?: string };

/** Envoie un code OTP au numéro de l'utilisateur connecté */
export async function actionEnvoyerOtp(telephone?: string): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  const numero = telephone?.trim() || utilisateur.telephone;

  if (!numero) {
    return { success: false, error: 'Aucun numéro de téléphone enregistré.' };
  }

  try {
    await OtpService.generer(utilisateur._id.toString(), numero);
    return { success: true, message: `Code envoyé par email à ${utilisateur.email}.` };
  } catch {
    return { success: false, error: "Impossible d'envoyer le code pour le moment." };
  }
}

/** Vérifie le code saisi */
export async function actionVerifierOtp(formData: FormData): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  const result = otpSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, error: 'Le code doit contenir 6 chiffres.' };
  }

  try {
    await OtpService.verifier(utilisateur._id.toString(), result.data.code);
    return { success: true, message: 'Numéro de téléphone vérifié.' };
  } catch (err) {
    switch ((err as Error).message) {
      case 'CODE_EXPIRE':
        return { success: false, error: 'Code expiré. Demandez un nouveau code.' };
      case 'TROP_DE_TENTATIVES':
        return { success: false, error: 'Trop de tentatives. Demandez un nouveau code.' };
      case 'CODE_ABSENT':
        return { success: false, error: 'Aucun code en cours. Demandez un code.' };
      default:
        return { success: false, error: 'Code incorrect.' };
    }
  }
}
