'use server';

/**
 * Module A - Paramètres Plateforme Server Actions (EF-54)
 */

import { ParametresPlateformeService } from '@/server/services/ParametresPlateformeService';
import { requireAdmin } from '@/server/middleware/rbac';
import { parametresPlateformeSchema } from '@/lib/zod/signalement.schemas';
import { revalidatePath } from 'next/cache';

export async function actionUpdateParametres(formData: FormData) {
  const admin = await requireAdmin();

  const brut = Object.fromEntries(formData);
  const result = parametresPlateformeSchema.safeParse(brut);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await ParametresPlateformeService.update(admin._id.toString(), result.data);
    revalidatePath('/admin/parametres');
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ['Erreur lors de la mise à jour'] } };
  }
}
