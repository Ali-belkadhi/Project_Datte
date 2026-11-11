// MODULE A — Comptes (Baha Ayadi)
/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { getUtilisateurCourant } from "@/lib/auth/rbac";
import { connectMongoose } from "@/server/db/mongoose";
import { Conversation, Fournisseur, Message, User } from "@/server/models";
import { toConversation, toMessage } from "../mappers";
import type { Conversation as ConversationDomaine } from "@/types/domain";

async function nomAffiche(userId: unknown) {
  const u = await User.findById(userId).select("prenom nom");
  return u ? `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || "Utilisateur" : "Utilisateur";
}

/**
 * Conversations de l'utilisateur courant, avec interlocuteur, dernier message
 * et historique complet convertis en objets de domaine.
 */
export async function listConversations(): Promise<ConversationDomaine[]> {
  const u = await getUtilisateurCourant();
  await connectMongoose();

  const mesFournisseurs = u.role === "FOURNISSEUR" ? await Fournisseur.find({ userId: u.id }).select("_id") : [];
  const mesFournisseurIds = mesFournisseurs.map((f) => String(f._id));

  const filtre =
    u.role === "FOURNISSEUR"
      ? { fournisseurId: { $in: mesFournisseurIds } }
      : { clientId: u.id };

  const convs = await Conversation.find(filtre).sort({ dernierMessageLe: -1, createdAt: -1 });

  const resultat: ConversationDomaine[] = [];
  for (const c of convs) {
    const dernier = await Message.findOne({ conversationId: c._id }).sort({ creeLe: -1 });
    const historique = await Message.find({ conversationId: c._id }).sort({ creeLe: 1 }).limit(200);
    const nonLus = await Message.countDocuments({ conversationId: c._id, lu: false, expediteurId: { $ne: u.id } });
    const f = await Fournisseur.findById(c.fournisseurId).select("nomBoutique");
    const clientName = await nomAffiche(c.clientId);
    const interlocuteur = u.role === "FOURNISSEUR" ? clientName : (f?.nomBoutique ?? "Boutique");
    const sujet = f?.nomBoutique ? `Boutique ${f.nomBoutique}` : "Discussion";
    resultat.push(
      toConversation({
        id: String(c._id),
        interlocuteur,
        sujet,
        dernierMessage: dernier?.contenu ?? "",
        dernierMessageLe: (dernier?.creeLe ?? c.createdAt ?? new Date()).toISOString(),
        nonLus,
        messages: historique.map((m: any) => toMessage(m, u.id)),
      }),
    );
  }
  return resultat;
}
