/**
 * Module A - RBAC Middleware
 * Role-Based Access Control for Server Actions and Route Handlers
 * CONTRACT: requireRole() exported and used by Modules B & C
 */

import { auth } from '@/lib/auth';
import { Role, StatutCompte } from '@/domain/enums';
import connectDB from '@/lib/mongoose';
import Utilisateur from '@/domain/models/Utilisateur';

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'ACCOUNT_SUSPENDED'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Get the current session user — throws if not authenticated */
export async function getUtilisateurCourant() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError('Non authentifié', 'UNAUTHENTICATED');
  }

  await connectDB();
  const utilisateur = await Utilisateur.findById(session.user.id)
    .select('_id email nom prenom telephone avatarUrl role statut langue emailVerifie telephoneVerifie')
    .lean();

  if (!utilisateur) {
    throw new AuthError('Utilisateur introuvable', 'UNAUTHENTICATED');
  }

  if (utilisateur.statut === StatutCompte.SUSPENDU) {
    throw new AuthError('Compte suspendu', 'ACCOUNT_SUSPENDED');
  }

  return utilisateur;
}

/**
 * CONTRACT function — used by Modules B & C
 * Verifies user is authenticated AND has the required role
 * Throws AuthError if not authorized
 */
export async function requireRole(role: Role | Role[]) {
  const utilisateur = await getUtilisateurCourant();
  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(utilisateur.role as Role)) {
    throw new AuthError(
      `Accès refusé. Rôle requis: ${roles.join(' ou ')}`,
      'UNAUTHORIZED'
    );
  }

  return utilisateur;
}

/** Shorthand helpers */
export const requireClient = () => requireRole(Role.CLIENT);
export const requireFournisseur = () => requireRole(Role.FOURNISSEUR);
export const requireAdmin = () => requireRole(Role.ADMIN);
export const requireClientOrFournisseur = () =>
  requireRole([Role.CLIENT, Role.FOURNISSEUR]);
