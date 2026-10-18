'use server';

/**
 * Module A - Auth Server Actions
 * Appelées directement depuis les Client Components.
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { AuthService } from '@/server/services/AuthService';
import { UtilisateurService } from '@/server/services/UtilisateurService';
import { TokenService } from '@/server/services/TokenService';
import { EmailService } from '@/server/services/EmailService';
import { getUtilisateurCourant } from '@/server/middleware/rbac';
import {
  inscriptionSchema,
  updateProfilSchema,
  motDePasseOublieSchema,
  reinitMotDePasseSchema,
} from '@/lib/zod/auth.schemas';
import { TypeJeton } from '@/domain/models/JetonSecurite';

type ReponseAction = {
  success: boolean;
  error?: string;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

// ─── INSCRIPTION (EF-01) ──────────────────────────────────────────────────────

export async function actionInscrire(formData: FormData): Promise<ReponseAction> {
  const result = inscriptionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const utilisateur = await UtilisateurService.inscrire(result.data);

    // Email de vérification (EF-01)
    const jeton = await TokenService.creer(utilisateur._id.toString(), TypeJeton.VERIF_EMAIL);
    await EmailService.envoyerVerificationEmail(
      utilisateur.email,
      utilisateur.prenom,
      TokenService.urlVerificationEmail(jeton)
    );

    return {
      success: true,
      message: 'Compte créé. Consultez votre boîte email pour activer votre compte.',
    };
  } catch (err) {
    if ((err as Error).message === 'EMAIL_ALREADY_EXISTS') {
      return { success: false, errors: { email: ['Cet email est déjà utilisé'] } };
    }
    return { success: false, error: 'Une erreur est survenue lors de la création du compte' };
  }
}

// ─── CONNEXION (EF-01) ────────────────────────────────────────────────────────

export async function actionConnecter(formData: FormData): Promise<ReponseAction> {
  const email = String(formData.get('email') ?? '').trim();
  const motDePasse = String(formData.get('motDePasse') ?? '');

  if (!email || !motDePasse) {
    return { success: false, error: 'Email et mot de passe sont requis' };
  }

  try {
    const { role } = await AuthService.connecter(email, motDePasse);
    return { success: true, message: role };
  } catch (err) {
    switch ((err as Error).message) {
      case 'COMPTE_SUSPENDU':
        return { success: false, error: 'Votre compte est suspendu. Contactez le support.' };
      case 'COMPTE_SUPPRIME':
        return { success: false, error: 'Ce compte a été supprimé.' };
      default:
        return { success: false, error: 'Email ou mot de passe incorrect' };
    }
  }
}

// ─── CONNEXION GOOGLE (EF-01) ─────────────────────────────────────────────────

export async function actionConnecterGoogle() {
  await signIn('google', { redirectTo: '/compte' });
}

// ─── DÉCONNEXION ──────────────────────────────────────────────────────────────

export async function actionDeconnecter() {
  await AuthService.deconnecter();
  redirect('/');
}

// ─── VÉRIFICATION EMAIL (EF-01 / 04) ──────────────────────────────────────────

export async function actionVerifierEmail(token: string): Promise<ReponseAction> {
  const utilisateurId = await TokenService.consommer(token, TypeJeton.VERIF_EMAIL);

  if (!utilisateurId) {
    return { success: false, error: 'Lien invalide ou expiré. Demandez un nouvel email.' };
  }

  await UtilisateurService.verifierEmail(utilisateurId);
  const utilisateur = await UtilisateurService.getUtilisateurById(utilisateurId);

  if (utilisateur) {
    await EmailService.envoyerBienvenue(utilisateur.email, utilisateur.prenom);
  }

  return { success: true, message: 'Votre email est vérifié. Vous pouvez vous connecter.' };
}

export async function actionRenvoyerVerification(): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();

  if (utilisateur.emailVerifie) {
    return { success: true, message: 'Votre email est déjà vérifié.' };
  }

  const jeton = await TokenService.creer(utilisateur._id.toString(), TypeJeton.VERIF_EMAIL);
  await EmailService.envoyerVerificationEmail(
    utilisateur.email,
    utilisateur.prenom,
    TokenService.urlVerificationEmail(jeton)
  );

  return { success: true, message: 'Email de vérification renvoyé.' };
}

// ─── MOT DE PASSE OUBLIÉ / RÉINITIALISATION (EF-04) ───────────────────────────

export async function actionMotDePasseOublie(formData: FormData): Promise<ReponseAction> {
  const result = motDePasseOublieSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const utilisateur = await UtilisateurService.getUtilisateurByEmail(result.data.email);

  // Anti-énumération : on répond toujours la même chose
  if (utilisateur) {
    const jeton = await TokenService.creer(utilisateur._id.toString(), TypeJeton.RESET_MDP);
    await EmailService.envoyerReinitialisationMotDePasse(
      utilisateur.email,
      utilisateur.prenom,
      TokenService.urlReinitialisation(jeton)
    );
  }

  return {
    success: true,
    message: 'Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé.',
  };
}

export async function actionReinitialiserMotDePasse(formData: FormData): Promise<ReponseAction> {
  const result = reinitMotDePasseSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const utilisateurId = await TokenService.consommer(result.data.token, TypeJeton.RESET_MDP);

  if (!utilisateurId) {
    return { success: false, error: 'Lien invalide ou expiré.' };
  }

  await UtilisateurService.definirMotDePasse(utilisateurId, result.data.nouveauMotDePasse);

  return { success: true, message: 'Mot de passe mis à jour. Vous pouvez vous connecter.' };
}

// ─── PROFIL (EF-05) ───────────────────────────────────────────────────────────

export async function actionUpdateProfil(formData: FormData): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();
  const result = updateProfilSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await UtilisateurService.updateProfil(utilisateur._id.toString(), result.data);
    revalidatePath('/compte');
    return { success: true, message: 'Profil mis à jour.' };
  } catch {
    return { success: false, error: 'Erreur de mise à jour' };
  }
}

// ─── CHANGER MOT DE PASSE ─────────────────────────────────────────────────────

export async function actionChangerMotDePasse(formData: FormData): Promise<ReponseAction> {
  const utilisateur = await getUtilisateurCourant();

  try {
    await UtilisateurService.changerMotDePasse(
      utilisateur._id.toString(),
      String(formData.get('ancienMotDePasse') ?? ''),
      String(formData.get('nouveauMotDePasse') ?? '')
    );
    return { success: true, message: 'Mot de passe modifié.' };
  } catch (err) {
    if ((err as Error).message === 'INVALID_PASSWORD') {
      return { success: false, error: 'Ancien mot de passe incorrect' };
    }
    return { success: false, error: 'Erreur lors du changement' };
  }
}
