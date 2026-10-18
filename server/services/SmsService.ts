/**
 * Module A - SmsService
 * Envoi de SMS pour les codes OTP (EF-02)
 */

const CLE = process.env.SMS_API_KEY;
const URL_API = process.env.SMS_API_URL;

export function smsConfigure(): boolean {
  return Boolean(CLE && URL_API && !CLE.startsWith('your-') && !URL_API.startsWith('your-'));
}

export class SmsService {
  /**
   * Envoie un SMS. Si aucun fournisseur n'est configuré (développement),
   * le message est simplement loggé pour permettre les tests.
   */
  static async envoyer(telephone: string, message: string) {
    if (!smsConfigure()) {
      console.info(`[SmsService] (dev) À ${telephone} — ${message}`);
      return { simule: true };
    }

    const reponse = await fetch(URL_API!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CLE}`,
      },
      body: JSON.stringify({ to: telephone, message }),
    });

    if (!reponse.ok) {
      console.error('[SmsService] Échec d’envoi', reponse.status, await reponse.text());
      throw new Error('SMS_ENVOI_ECHOUE');
    }

    return { simule: false };
  }

  static envoyerCodeOtp(telephone: string, code: string, minutesValidite: number) {
    return SmsService.envoyer(
      telephone,
      `DEGLA : votre code de vérification est ${code}. Valable ${minutesValidite} minutes. Ne le partagez avec personne.`
    );
  }
}

export default SmsService;
