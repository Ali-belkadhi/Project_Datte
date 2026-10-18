/**
 * Module A - AuthService
 * Connexion email / mot de passe avec sessions PERSISTÉES EN BASE (EF-01)
 *
 * Auth.js ne supporte pas le provider Credentials avec la stratégie
 * `database`. On crée donc la session nous-mêmes via l'adaptateur MongoDB,
 * puis on pose le cookie attendu par Auth.js : `auth()` la résout ensuite
 * comme n'importe quelle session (Google inclus).
 */

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongoose';
import Utilisateur from '@/domain/models/Utilisateur';
import { adapter } from '@/lib/auth-adapter';
import { StatutCompte } from '@/domain/enums';

const DUREE_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function nomCookieSession() {
  return process.env.NEXTAUTH_URL?.startsWith('https')
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';
}

export class AuthService {
  /**
   * Vérifie les identifiants puis ouvre une session en base.
   * Erreurs possibles : IDENTIFIANTS_INVALIDES | COMPTE_SUSPENDU | COMPTE_SUPPRIME
   */
  static async connecter(email: string, motDePasse: string) {
    await connectDB();

    const utilisateur = await Utilisateur.findOne({ email: email.toLowerCase().trim() }).select(
      '+motDePasseHash'
    );

    if (!utilisateur?.motDePasseHash) throw new Error('IDENTIFIANTS_INVALIDES');

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) throw new Error('IDENTIFIANTS_INVALIDES');

    if (utilisateur.statut === StatutCompte.SUSPENDU) throw new Error('COMPTE_SUSPENDU');
    if (utilisateur.statut === StatutCompte.SUPPRIME) throw new Error('COMPTE_SUPPRIME');

    await AuthService.creerSession(utilisateur._id.toString());

    await Utilisateur.findByIdAndUpdate(utilisateur._id, {
      $set: { derniereConnexion: new Date() },
    });

    return {
      utilisateurId: utilisateur._id.toString(),
      role: utilisateur.role as string,
    };
  }

  /** Crée la session en base et pose le cookie Auth.js */
  static async creerSession(utilisateurId: string) {
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + DUREE_SESSION_MS);

    await adapter.createSession!({ sessionToken, userId: utilisateurId, expires });

    const jar = await cookies();
    jar.set(nomCookieSession(), sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      expires,
    });
  }

  /** Supprime la session en base et efface le cookie */
  static async deconnecter() {
    const jar = await cookies();
    const nom = nomCookieSession();
    const token = jar.get(nom)?.value;

    if (token) {
      try {
        await adapter.deleteSession!(token);
      } catch {
        // Session déjà absente : rien à faire
      }
      jar.delete(nom);
    }
  }

  /** Toutes les sessions d'un utilisateur (déconnexion globale) */
  static async supprimerToutesLesSessions(utilisateurId: string) {
    await connectDB();
    const { clientPromise } = await import('@/lib/auth-adapter');
    const client = await clientPromise;
    const { ObjectId } = await import('mongodb');
    await client.db().collection('sessions').deleteMany({ userId: new ObjectId(utilisateurId) });
  }
}

export default AuthService;
