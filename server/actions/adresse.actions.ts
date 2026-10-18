'use server';

/**
 * Module A - Adresse Server Actions (EF-05)
 */

import { revalidatePath } from 'next/cache';
import { requireClient } from '@/server/middleware/rbac';
import { AdresseService } from '@/server/services/AdresseService';
import { adresseSchema, updateAdresseSchema } from '@/lib/zod/adresse.schemas';

type ReponseAction = {
  success: boolean;
  error?: string;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

function parseForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  // Les champs optionnels numériques arrivent en chaîne : on les nettoie
  const cleaned: Record<string, unknown> = { ...raw };
  if (!cleaned.ligne2) delete cleaned.ligne2;
  for (const key of ['latitude', 'longitude']) {
    if (cleaned[key] === '' || cleaned[key] === undefined) delete cleaned[key];
    else cleaned[key] = Number(cleaned[key]);
  }
  return cleaned;
}

export async function actionAjouterAdresse(formData: FormData): Promise<ReponseAction> {
  const utilisateur = await requireClient();
  const result = adresseSchema.safeParse(parseForm(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await AdresseService.creer(utilisateur._id.toString(), result.data);
    revalidatePath('/compte');
    return { success: true, message: 'Adresse ajoutée.' };
  } catch {
    return { success: false, error: "Erreur lors de l'ajout de l'adresse" };
  }
}

export async function actionModifierAdresse(
  adresseId: string,
  formData: FormData
): Promise<ReponseAction> {
  const utilisateur = await requireClient();
  const result = updateAdresseSchema.safeParse(parseForm(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await AdresseService.modifier(utilisateur._id.toString(), adresseId, result.data);
    revalidatePath('/compte');
    return { success: true, message: 'Adresse mise à jour.' };
  } catch {
    return { success: false, error: 'Adresse introuvable' };
  }
}

export async function actionSupprimerAdresse(adresseId: string): Promise<ReponseAction> {
  const utilisateur = await requireClient();
  try {
    await AdresseService.supprimer(utilisateur._id.toString(), adresseId);
    revalidatePath('/compte');
    return { success: true, message: 'Adresse supprimée.' };
  } catch {
    return { success: false, error: 'Adresse introuvable' };
  }
}

export async function actionDefinirAdresseParDefaut(adresseId: string): Promise<ReponseAction> {
  const utilisateur = await requireClient();
  try {
    await AdresseService.definirParDefaut(utilisateur._id.toString(), adresseId);
    revalidatePath('/compte');
    return { success: true, message: 'Adresse par défaut mise à jour.' };
  } catch {
    return { success: false, error: 'Adresse introuvable' };
  }
}
