/**
 * Module A - TokenService
 * Génération / consommation des jetons de vérification d'email
 * et de réinitialisation de mot de passe.
 */

import crypto from 'node:crypto';
import connectDB from '@/lib/mongoose';
import JetonSecurite, { TypeJeton } from '@/domain/models/JetonSecurite';

const DUREE_VERIF_EMAIL_MS = 24 * 60 * 60 * 1000; // 24 h
const DUREE_RESET_MDP_MS = 60 * 60 * 1000; // 1 h

function hacher(jeton: string) {
  return crypto.createHash('sha256').update(jeton).digest('hex');
}

export class TokenService {
  /** Crée (ou remplace) un jeton et renvoie la valeur en clair à envoyer par email */
  static async creer(utilisateurId: string, type: TypeJeton): Promise<string> {
    await connectDB();

    const jetonClair = crypto.randomBytes(32).toString('hex');
    const duree = type === TypeJeton.VERIF_EMAIL ? DUREE_VERIF_EMAIL_MS : DUREE_RESET_MDP_MS;

    await JetonSecurite.findOneAndUpdate(
      { utilisateurId, type },
      {
        $set: {
          tokenHash: hacher(jetonClair),
          expiresAt: new Date(Date.now() + duree),
          utiliseLe: null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return jetonClair;
  }

  /** Valide un jeton et le consomme. Renvoie l'utilisateurId ou null. */
  static async consommer(jetonClair: string, type: TypeJeton): Promise<string | null> {
    await connectDB();

    const jeton = await JetonSecurite.findOne({
      tokenHash: hacher(jetonClair),
      type,
    });

    if (!jeton || jeton.utiliseLe) return null;
    if (jeton.expiresAt.getTime() < Date.now()) return null;

    jeton.utiliseLe = new Date();
    await jeton.save();

    return jeton.utilisateurId.toString();
  }

  /** URL de vérification d'email */
  static urlVerificationEmail(jeton: string) {
    return `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/verifier-email?token=${jeton}`;
  }

  /** URL de réinitialisation de mot de passe */
  static urlReinitialisation(jeton: string) {
    return `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/reinitialiser-mot-de-passe?token=${jeton}`;
  }
}

export default TokenService;
