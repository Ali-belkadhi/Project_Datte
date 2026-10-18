'use server';

/**
 * Module A - Notification Server Actions (EF-43)
 */

import { revalidatePath } from 'next/cache';
import { getUtilisateurCourant } from '@/server/middleware/rbac';
import { NotificationService } from '@/server/services/NotificationService';

type ReponseAction = { success: boolean; error?: string; message?: string };

export async function actionMarquerLue(notifId: string): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  try {
    await NotificationService.marquerLue(notifId, utilisateur._id.toString());
    revalidatePath('/notifications');
    return { success: true };
  } catch {
    return { success: false, error: 'Notification introuvable' };
  }
}

export async function actionMarquerToutesLues(): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  try {
    await NotificationService.marquerToutesLues(utilisateur._id.toString());
    revalidatePath('/notifications');
    return { success: true, message: 'Toutes les notifications sont lues.' };
  } catch {
    return { success: false, error: 'Action impossible' };
  }
}

export async function actionSouscrirePush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  try {
    await NotificationService.souscrirePush(utilisateur._id.toString(), subscription);
    return { success: true, message: 'Notifications push activées.' };
  } catch {
    return { success: false, error: 'Activation impossible' };
  }
}

export async function actionSupprimerPush(endpoint: string): Promise<ReponseAction> {
  await getUtilisateurCourant();
  try {
    await NotificationService.supprimerSouscription(endpoint);
    return { success: true, message: 'Notifications push désactivées.' };
  } catch {
    return { success: false, error: 'Désactivation impossible' };
  }
}
