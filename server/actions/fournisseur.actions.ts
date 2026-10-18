'use server';

/**
 * Module A - Fournisseur Server Actions
 */

import { FournisseurService } from '@/server/services/FournisseurService';
import { DocumentFournisseurService } from '@/server/services/DocumentFournisseurService';
import { NotificationService } from '@/server/services/NotificationService';
import { requireFournisseur, requireAdmin } from '@/server/middleware/rbac';
import {
  onboardingFournisseurSchema,
  updateBoutiqueSchema,
  validerFournisseurSchema,
  suspendreFournisseurSchema,
  documentFournisseurSchema,
} from '@/lib/zod/fournisseur.schemas';
import { TypeNotification } from '@/domain/enums';
import { revalidatePath } from 'next/cache';

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

export async function actionOnboardingFournisseur(formData: FormData) {
  const utilisateur = await requireFournisseur();
  const raw = Object.fromEntries(formData);
  const result = onboardingFournisseurSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const fournisseur = await FournisseurService.creerProfil(
      utilisateur._id.toString(),
      result.data
    );
    revalidatePath('/fournisseur/tableau-de-bord');
    return { success: true, fournisseurId: fournisseur._id.toString() };
  } catch (err: any) {
    const msg =
      err.message === 'PROFIL_EXISTE_DEJA'
        ? 'Profil fournisseur déjà créé'
        : 'Erreur lors de la création';
    return { success: false, errors: { _form: [msg] } };
  }
}

// ─── UPDATE BOUTIQUE ─────────────────────────────────────────────────────────

export async function actionUpdateBoutique(
  fournisseurId: string,
  formData: FormData
) {
  await requireFournisseur();
  const raw = Object.fromEntries(formData);
  const result = updateBoutiqueSchema.safeParse(raw);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await FournisseurService.updateBoutique(fournisseurId, result.data);
    revalidatePath(`/fournisseur/boutique`);
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ['Erreur de mise à jour'] } };
  }
}

// ─── ADMIN: VALIDER ───────────────────────────────────────────────────────────

export async function actionValiderFournisseur(formData: FormData) {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData);
  const valide = raw.valide === 'true';

  const result = validerFournisseurSchema.safeParse({ ...raw, valide });

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const fournisseur = await FournisseurService.valider(
      result.data,
      admin._id.toString()
    );

    // Notify the fournisseur
    await NotificationService.notifier(
      fournisseur.utilisateurId.toString(),
      TypeNotification.FOURNISSEUR_VALIDE,
      {
        titre: valide ? '✅ Boutique validée !' : '❌ Demande refusée',
        contenu: valide
          ? 'Votre boutique a été validée. Vous pouvez maintenant publier vos produits.'
          : `Votre demande a été refusée. Motif: ${result.data.motifRefus}`,
        lien: '/fournisseur/tableau-de-bord',
      }
    );

    revalidatePath('/admin/fournisseurs');
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ['Erreur lors de la validation'] } };
  }
}

// ─── ADMIN: SUSPENDRE ─────────────────────────────────────────────────────────

export async function actionSuspendreFournisseur(formData: FormData) {
  const admin = await requireAdmin();
  const result = suspendreFournisseurSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const fournisseur = await FournisseurService.suspendre(
      result.data.fournisseurId,
      admin._id.toString(),
      result.data.motif
    );

    await NotificationService.notifier(
      fournisseur.utilisateurId.toString(),
      TypeNotification.FOURNISSEUR_VALIDE,
      {
        titre: '⛔ Boutique suspendue',
        contenu: result.data.motif
          ? `Votre boutique a été suspendue. Motif : ${result.data.motif}`
          : 'Votre boutique a été suspendue. Contactez le support.',
        lien: '/fournisseur/tableau-de-bord',
      }
    );

    revalidatePath('/admin/fournisseurs');
    revalidatePath(`/admin/fournisseurs/${result.data.fournisseurId}`);
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ['Erreur lors de la suspension'] } };
  }
}

// ─── DOCUMENTS FOURNISSEUR ────────────────────────────────────────────────────

export async function actionAjouterDocument(formData: FormData) {
  const utilisateur = await requireFournisseur();
  const result = documentFournisseurSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const fournisseur = await FournisseurService.getFournisseurByUtilisateur(
    utilisateur._id.toString()
  );
  if (!fournisseur) {
    return { success: false, errors: { _form: ['Profil fournisseur introuvable'] } };
  }

  try {
    await DocumentFournisseurService.ajouter(
      fournisseur._id.toString(),
      utilisateur._id.toString(),
      result.data
    );
    revalidatePath('/fournisseur/onboarding');
    revalidatePath('/fournisseur/boutique');
    return { success: true };
  } catch {
    return { success: false, errors: { _form: ["Erreur lors de l'ajout du document"] } };
  }
}
