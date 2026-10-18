'use server';

/**
 * Module A - Signalement Server Actions (EF-52)
 */

import { SignalementService } from '@/server/services/SignalementService';
import { requireAdmin, getUtilisateurCourant } from '@/server/middleware/rbac';
import { signalementSchema, traiterSignalementSchema } from '@/lib/zod/signalement.schemas';
import { revalidatePath } from 'next/cache';

/** Utilisateur connecté signale un contenu */
export async function actionSignaler(formData: FormData) {
  const utilisateur = await getUtilisateurCourant();
  const result = signalementSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await SignalementService.creer(utilisateur._id.toString(), result.data);
    revalidatePath('/admin/signalements');
    return { success: true, message: 'Merci, votre signalement a été transmis.' };
  } catch {
    return { success: false, errors: { _form: ['Erreur lors du signalement'] } };
  }
}

/** Admin traite un signalement */
export async function actionTraiterSignalement(formData: FormData) {
  const admin = await requireAdmin();
  const result = traiterSignalementSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await SignalementService.traiter(
      result.data.signalementId,
      admin._id.toString(),
      result.data.statut,
      result.data.motif
    );
    revalidatePath('/admin/signalements');
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ['Erreur lors du traitement'] } };
  }
}
