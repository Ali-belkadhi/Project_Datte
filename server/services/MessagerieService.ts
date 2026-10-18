/**
 * Module A - MessagerieService
 * Client ↔ Fournisseur messaging
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import Conversation from '@/domain/models/Conversation';
import Message from '@/domain/models/Message';
import Client from '@/domain/models/Client';
import Fournisseur from '@/domain/models/Fournisseur';
import Utilisateur from '@/domain/models/Utilisateur';
import { NotificationService } from './NotificationService';
import { TypeNotification, Role } from '@/domain/enums';

export interface ConversationVue {
  id: string;
  interlocuteurNom: string;
  dernierMessageLe: string;
  dernierMessage?: string;
  nonLus: number;
}

export class MessagerieService {

  static async getOuCreerConversation(
    clientId: string,
    fournisseurId: string,
    produitId?: string,
    sousCommandeId?: string
  ) {
    await connectDB();

    const query: Record<string, any> = { clientId, fournisseurId };
    if (produitId) query.produitId = produitId;
    if (sousCommandeId) query.sousCommandeId = sousCommandeId;

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        clientId,
        fournisseurId,
        produitId,
        sousCommandeId,
        dernierMessageLe: new Date(),
      });
    }

    return conversation;
  }

  static async envoyerMessage(
    conversationId: string,
    expediteurId: string,
    contenu: string,
    destinataireId: string
  ) {
    await connectDB();

    const message = await Message.create({
      conversationId,
      expediteurId,
      contenu: contenu.slice(0, 2000),
    });

    // Update last message timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { dernierMessageLe: new Date() },
    });

    // Notify recipient
    await NotificationService.notifier(destinataireId, TypeNotification.NOUVEAU_MESSAGE, {
      titre: 'Nouveau message',
      contenu: contenu.slice(0, 100),
      lien: `/messages/${conversationId}`,
    });

    return message;
  }

  static async getMessages(conversationId: string, page = 1, limit = 50) {
    await connectDB();
    const skip = (page - 1) * limit;

    return Message.find({ conversationId })
      .sort({ creeLe: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async getConversations(utilisateurId: string, role: 'client' | 'fournisseur') {
    await connectDB();
    const field = role === 'client' ? 'clientId' : 'fournisseurId';

    return Conversation.find({ [field]: utilisateurId })
      .sort({ dernierMessageLe: -1 })
      .populate(role === 'client' ? 'fournisseurId' : 'clientId')
      .populate('produitId', 'nom')
      .lean();
  }

  static async marquerMessagesLus(conversationId: string, utilisateurId: string) {
    await connectDB();
    return Message.updateMany(
      { conversationId, expediteurId: { $ne: utilisateurId }, lu: false },
      { $set: { lu: true } }
    );
  }

  // ─── UI HELPERS ──────────────────────────────────────────────────────────────

  /** Résout le profil (Client/Fournisseur) lié à un utilisateur selon son rôle */
  static async resoudreProfil(
    utilisateurId: string,
    role: Role
  ): Promise<{ type: 'client' | 'fournisseur'; profilId: string; nom: string } | null> {
    await connectDB();

    if (role === Role.FOURNISSEUR) {
      const f = await Fournisseur.findOne({ utilisateurId }).select('_id nomBoutique').lean();
      if (!f) return null;
      return { type: 'fournisseur', profilId: f._id.toString(), nom: f.nomBoutique };
    }

    const c = await Client.findOne({ utilisateurId }).select('_id').lean();
    if (!c) return null;
    return { type: 'client', profilId: c._id.toString(), nom: 'Client' };
  }

  /** Liste les conversations d'un utilisateur, enrichies (interlocuteur, non lus, dernier message) */
  static async listerConversations(
    utilisateurId: string,
    role: Role
  ): Promise<ConversationVue[]> {
    await connectDB();
    const profil = await MessagerieService.resoudreProfil(utilisateurId, role);
    if (!profil) return [];

    const field = profil.type === 'client' ? 'clientId' : 'fournisseurId';
    const convs = await Conversation.find({ [field]: profil.profilId })
      .sort({ dernierMessageLe: -1 })
      .lean();

    if (convs.length === 0) return [];
    const ids = convs.map((c) => c._id);

    const [derniers, nonLus, noms] = await Promise.all([
      Message.aggregate<{ _id: mongoose.Types.ObjectId; contenu: string }>([
        { $match: { conversationId: { $in: ids } } },
        { $sort: { creeLe: -1 } },
        { $group: { _id: '$conversationId', contenu: { $first: '$contenu' } } },
      ]),
      Message.aggregate<{ _id: mongoose.Types.ObjectId; total: number }>([
        {
          $match: {
            conversationId: { $in: ids },
            expediteurId: { $ne: new mongoose.Types.ObjectId(utilisateurId) },
            lu: false,
          },
        },
        { $group: { _id: '$conversationId', total: { $sum: 1 } } },
      ]),
      MessagerieService.resoudreNoms(convs, profil.type),
    ]);

    const derniersMap = new Map(derniers.map((d) => [d._id.toString(), d.contenu]));
    const nonLusMap = new Map(nonLus.map((n) => [n._id.toString(), n.total]));

    return convs.map((c) => {
      const id = c._id.toString();
      const cleInterlocuteur =
        profil.type === 'client' ? c.fournisseurId.toString() : c.clientId.toString();
      return {
        id,
        interlocuteurNom: noms.get(cleInterlocuteur) ?? 'Utilisateur',
        dernierMessageLe: new Date(c.dernierMessageLe).toISOString(),
        dernierMessage: derniersMap.get(id),
        nonLus: nonLusMap.get(id) ?? 0,
      };
    });
  }

  /** Résout les noms affichables des interlocuteurs d'une liste de conversations */
  private static async resoudreNoms(
    convs: { clientId: mongoose.Types.ObjectId; fournisseurId: mongoose.Types.ObjectId }[],
    type: 'client' | 'fournisseur'
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();

    if (type === 'client') {
      const fournisseurs = await Fournisseur.find({
        _id: { $in: convs.map((c) => c.fournisseurId) },
      })
        .select('_id nomBoutique')
        .lean();
      for (const f of fournisseurs) map.set(f._id.toString(), f.nomBoutique);
    } else {
      const clients = await Client.find({ _id: { $in: convs.map((c) => c.clientId) } })
        .select('_id utilisateurId')
        .lean();
      const utilisateurs = await Utilisateur.find({
        _id: { $in: clients.map((c) => c.utilisateurId) },
      })
        .select('_id nom prenom email')
        .lean();
      const nomsUtilisateurs = new Map(
        utilisateurs.map((u) => [
          u._id.toString(),
          `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email,
        ])
      );
      for (const c of clients) {
        map.set(c._id.toString(), nomsUtilisateurs.get(c.utilisateurId.toString()) ?? 'Client');
      }
    }

    return map;
  }

  /** Vérifie l'accès et renvoie la conversation (ou null) */
  static async getConversationAcces(
    conversationId: string,
    utilisateurId: string,
    role: Role
  ) {
    await connectDB();
    const profil = await MessagerieService.resoudreProfil(utilisateurId, role);
    if (!profil) return null;

    const field = profil.type === 'client' ? 'clientId' : 'fournisseurId';
    return Conversation.findOne({ _id: conversationId, [field]: profil.profilId }).lean();
  }

  /** Nom affichable de l'interlocuteur d'une conversation */
  static async getInterlocuteurNom(
    conversation: { clientId: mongoose.Types.ObjectId; fournisseurId: mongoose.Types.ObjectId },
    role: Role
  ): Promise<string> {
    await connectDB();
    if (role === Role.FOURNISSEUR) {
      const client = await Client.findById(conversation.clientId)
        .select('utilisateurId')
        .lean();
      if (!client) return 'Client';
      const u = await Utilisateur.findById(client.utilisateurId)
        .select('nom prenom email')
        .lean();
      if (!u) return 'Client';
      return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
    }

    const f = await Fournisseur.findById(conversation.fournisseurId)
      .select('nomBoutique')
      .lean();
    return f?.nomBoutique ?? 'Boutique';
  }

  /** Détermine l'identifiant utilisateur du destinataire d'une conversation */
  static async getDestinataireId(
    conversation: { clientId: mongoose.Types.ObjectId; fournisseurId: mongoose.Types.ObjectId },
    role: Role
  ): Promise<string | null> {
    await connectDB();
    if (role === Role.FOURNISSEUR) {
      const client = await Client.findById(conversation.clientId)
        .select('utilisateurId')
        .lean();
      return client?.utilisateurId.toString() ?? null;
    }
    const f = await Fournisseur.findById(conversation.fournisseurId)
      .select('utilisateurId')
      .lean();
    return f?.utilisateurId.toString() ?? null;
  }
}

export default MessagerieService;
