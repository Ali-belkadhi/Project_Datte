/**
 * Module A - OtpService
 * Génération / vérification des codes OTP SMS avec expiration
 * et limite de tentatives (EF-02)
 */

import crypto from 'node:crypto';
import connectDB from '@/lib/mongoose';
import CodeOtp from '@/domain/models/CodeOtp';
import Utilisateur from '@/domain/models/Utilisateur';
import JournalAudit from '@/domain/models/JournalAudit';
import { SmsService } from './SmsService';
import { EmailService } from './EmailService';

const DUREE_OTP_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TENTATIVES = 5;

function hacher(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export class OtpService {
  /** Génère un code à 6 chiffres, l'enregistre (haché) et l'envoie par SMS */
  static async generer(utilisateurId: string, telephone: string) {
    await connectDB();

    const code = crypto.randomInt(100000, 1000000).toString();

    await CodeOtp.findOneAndUpdate(
      { utilisateurId },
      {
        $set: {
          telephone,
          codeHash: hacher(code),
          expiresAt: new Date(Date.now() + DUREE_OTP_MS),
          tentatives: 0,
          maxTentatives: MAX_TENTATIVES,
          consommeLe: null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Envoi par email au compte de l'utilisateur (canal principal en développement)
    const utilisateur = await Utilisateur.findById(utilisateurId)
      .select('email prenom')
      .lean();
    if (utilisateur?.email) {
      try {
        await EmailService.envoyerCodeOtp(
          utilisateur.email,
          code,
          DUREE_OTP_MS / 60000,
          utilisateur.prenom
        );
      } catch (err) {
        console.error('[OtpService] Échec de l’envoi de l’OTP par email', err);
      }
    }

    // Envoi SMS (best-effort, ne bloque pas si le fournisseur n'est pas configuré)
    try {
      await SmsService.envoyerCodeOtp(telephone, code, DUREE_OTP_MS / 60000);
    } catch (err) {
      console.error('[OtpService] Échec de l’envoi de l’OTP par SMS', err);
    }

    return { envoye: true, expiresInSeconds: DUREE_OTP_MS / 1000 };
  }

  /**
   * Vérifie un code. Lève une erreur explicite en cas d'échec :
   * CODE_ABSENT | CODE_EXPIRE | TROP_DE_TENTATIVES | CODE_INVALIDE
   */
  static async verifier(utilisateurId: string, code: string) {
    await connectDB();

    const otp = await CodeOtp.findOne({ utilisateurId });
    if (!otp || otp.consommeLe) throw new Error('CODE_ABSENT');
    if (otp.expiresAt.getTime() < Date.now()) throw new Error('CODE_EXPIRE');
    if (otp.tentatives >= otp.maxTentatives) throw new Error('TROP_DE_TENTATIVES');

    if (otp.codeHash !== hacher(code)) {
      otp.tentatives += 1;
      await otp.save();
      throw new Error(
        otp.tentatives >= otp.maxTentatives ? 'TROP_DE_TENTATIVES' : 'CODE_INVALIDE'
      );
    }

    otp.consommeLe = new Date();
    await otp.save();

    await Utilisateur.findByIdAndUpdate(utilisateurId, {
      $set: { telephoneVerifie: true, telephone: otp.telephone },
    });

    await JournalAudit.create({
      utilisateurId,
      action: 'TELEPHONE_VERIFIE',
      entite: 'Utilisateur',
      entiteId: utilisateurId,
    });

    return true;
  }
}

export default OtpService;
