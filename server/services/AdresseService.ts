/**
 * Module A - AdresseService
 * Gestion des adresses de livraison multiples d'un client (EF-05)
 */

import connectDB from '@/lib/mongoose';
import Adresse from '@/domain/models/Adresse';
import Client from '@/domain/models/Client';
import JournalAudit from '@/domain/models/JournalAudit';
import type { AdresseInput, UpdateAdresseInput } from '@/lib/zod/adresse.schemas';

export class AdresseService {
  /** Résout (et crée si besoin) le profil Client lié à un utilisateur */
  static async getClientId(utilisateurId: string): Promise<string> {
    await connectDB();
    let client = await Client.findOne({ utilisateurId });
    if (!client) client = await Client.create({ utilisateurId });
    return client._id.toString();
  }

  static async lister(utilisateurId: string) {
    await connectDB();
    const clientId = await AdresseService.getClientId(utilisateurId);
    return Adresse.find({ clientId }).sort({ creeLe: -1 }).lean();
  }

  static async creer(utilisateurId: string, data: AdresseInput) {
    await connectDB();
    const clientId = await AdresseService.getClientId(utilisateurId);

    const adresse = await Adresse.create({ ...data, clientId });

    // Première adresse => adresse par défaut
    const total = await Adresse.countDocuments({ clientId });
    if (total === 1) {
      await Client.findByIdAndUpdate(clientId, { $set: { adresseParDefautId: adresse._id } });
    }

    await JournalAudit.create({
      utilisateurId,
      action: 'ADRESSE_AJOUTEE',
      entite: 'Adresse',
      entiteId: adresse._id.toString(),
    });

    return adresse;
  }

  static async modifier(utilisateurId: string, adresseId: string, data: UpdateAdresseInput) {
    await connectDB();
    const clientId = await AdresseService.getClientId(utilisateurId);

    const adresse = await Adresse.findOneAndUpdate(
      { _id: adresseId, clientId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!adresse) throw new Error('ADRESSE_NOT_FOUND');
    return adresse;
  }

  static async supprimer(utilisateurId: string, adresseId: string) {
    await connectDB();
    const clientId = await AdresseService.getClientId(utilisateurId);

    const res = await Adresse.deleteOne({ _id: adresseId, clientId });
    if (res.deletedCount === 0) throw new Error('ADRESSE_NOT_FOUND');

    await Client.findOneAndUpdate(
      { _id: clientId, adresseParDefautId: adresseId },
      { $unset: { adresseParDefautId: 1 } }
    );
  }

  static async definirParDefaut(utilisateurId: string, adresseId: string) {
    await connectDB();
    const clientId = await AdresseService.getClientId(utilisateurId);

    const adresse = await Adresse.findOne({ _id: adresseId, clientId });
    if (!adresse) throw new Error('ADRESSE_NOT_FOUND');

    await Client.findByIdAndUpdate(clientId, { $set: { adresseParDefautId: adresseId } });
  }
}

export default AdresseService;
