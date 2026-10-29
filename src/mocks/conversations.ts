// données de démonstration — conversations acheteur ↔ vendeurs
import type { Conversation, Message } from "@/types/domain";

type Brut = [auteur: "moi" | "autre", contenu: string, minute: number];

function fil(id: string, debut: string, bruts: Brut[]): Message[] {
  const t0 = new Date(debut).getTime();
  return bruts.map(([auteur, contenu, minute], i) => ({
    id: `${id}-m${i + 1}`,
    conversationId: id,
    auteur,
    contenu,
    envoyeLe: new Date(t0 + minute * 60000).toISOString(),
    lu: i < bruts.length - 1 || auteur === "moi",
  }));
}

function conversation(c: Omit<Conversation, "messages" | "dernierMessage" | "dernierMessageLe"> & { debut: string; bruts: Brut[] }): Conversation {
  const messages = fil(c.id, c.debut, c.bruts);
  const dernier = messages[messages.length - 1];
  const { debut: _debut, bruts: _bruts, ...reste } = c;
  return { ...reste, messages, dernierMessage: dernier.contenu, dernierMessageLe: dernier.envoyeLe };
}

export const CONVERSATIONS_CLIENT: Conversation[] = [
  conversation({
    id: "cv-1",
    interlocuteur: "Palmeraie Ben Amor",
    interlocuteurInitiales: "PB",
    couleur: "amber",
    sujet: "Commande DGL-2026-000123",
    produitNom: "Deglet Nour Extra branchée",
    nonLus: 1,
    debut: "2026-10-17T19:00:00+01:00",
    bruts: [
      ["moi", "Bonjour, est-il possible de recevoir le régime avant vendredi ? C'est pour un repas de famille.", 0],
      ["autre", "Bonjour Sarra, merci pour votre commande ! Nous cueillons ce soir pour une expédition demain matin.", 22],
      ["moi", "Parfait, merci beaucoup. Les dattes sont-elles bien de la récolte 2026 ?", 30],
      ["autre", "Oui, cueillies cette semaine dans notre palmeraie de Tozeur, à pleine maturité.", 41],
      ["moi", "Super. Et pour la pâte de datte, elle se conserve combien de temps ?", 45],
      ["autre", "Six mois au frais une fois ouverte, un an fermée. Elle est 100 % datte, sans ajout.", 58],
      ["moi", "Merci pour toutes ces précisions !", 60],
      ["autre", "Avec plaisir. Votre régime partira demain matin, vous recevrez le numéro de suivi par SMS.", 125],
    ],
  }),
  conversation({
    id: "cv-2",
    interlocuteur: "Maison Rob Gabès",
    interlocuteurInitiales: "MR",
    couleur: "clay",
    sujet: "Conservation du rob",
    produitNom: "Rob de datte au feu de bois",
    nonLus: 0,
    debut: "2026-09-28T16:00:00+01:00",
    bruts: [
      ["moi", "Bonjour, comment conserver le rob une fois ouvert ?", 0],
      ["autre", "Bonjour ! À température ambiante, à l'abri de la lumière. Il n'a pas besoin du réfrigérateur.", 35],
      ["moi", "Et combien de temps se garde-t-il ?", 40],
      ["autre", "Le rob se conserve un an à l'abri de la lumière. S'il cristallise un peu, un bain-marie suffit.", 105],
      ["moi", "Merci, je passe commande alors.", 110],
      ["autre", "Merci à vous, bonne dégustation !", 118],
    ],
  }),
  conversation({
    id: "cv-3",
    interlocuteur: "Coopérative Oasis de Douz",
    interlocuteurInitiales: "CO",
    couleur: "palm",
    sujet: "Medjool Jumbo — calibre",
    produitNom: "Medjool Jumbo",
    nonLus: 0,
    debut: "2026-10-12T10:00:00+01:00",
    bruts: [
      ["moi", "Bonjour, quel est le poids moyen d'une Medjool Jumbo ?", 0],
      ["autre", "Bonjour, entre 22 et 28 g la datte, soit environ 40 dattes au kilo.", 18],
      ["moi", "Parfait. Vous livrez à Tunis en combien de temps ?", 25],
      ["autre", "Nous expédions sous 48 h, comptez 3 à 4 jours en standard ou 48 h en express.", 40],
      ["moi", "Merci, je commande 1 kg.", 44],
      ["autre", "Merci Sarra ! Nous vous envoyons le suivi dès l'expédition.", 52],
      ["autre", "Votre colis est parti ce matin avec Rapid-Poste.", 2900],
    ],
  }),
  conversation({
    id: "cv-4",
    interlocuteur: "Les Délices de Nefta",
    interlocuteurInitiales: "DN",
    couleur: "date",
    sujet: "Coffret pour un mariage",
    produitNom: "Coffret cadeau « Oasis »",
    nonLus: 0,
    debut: "2026-09-20T11:00:00+01:00",
    bruts: [
      ["moi", "Bonjour, proposez-vous des coffrets personnalisés pour un mariage (50 pièces) ?", 0],
      ["autre", "Bonjour ! Oui, nous pouvons ajouter un ruban et une étiquette aux prénoms des mariés.", 60],
      ["moi", "Quel serait le délai pour 50 coffrets ?", 70],
      ["autre", "Comptez dix jours ouvrés. Nous pouvons vous envoyer un coffret témoin avant.", 95],
      ["moi", "Ce serait parfait, merci.", 100],
      ["autre", "C'est noté, nous vous recontactons dès que le témoin est prêt.", 130],
    ],
  }),
];

export const CONVERSATIONS_FOURNISSEUR: Conversation[] = [
  conversation({
    id: "cvf-1",
    interlocuteur: "Sarra M. — Tunis",
    interlocuteurInitiales: "SM",
    couleur: "amber",
    sujet: "Commande DGL-2026-000123",
    produitNom: "Deglet Nour Extra branchée",
    nonLus: 1,
    debut: "2026-10-17T19:00:00+01:00",
    bruts: [
      ["autre", "Bonjour, est-il possible de recevoir le régime avant vendredi ? C'est pour un repas de famille.", 0],
      ["moi", "Bonjour Sarra, merci pour votre commande ! Nous cueillons ce soir pour une expédition demain matin.", 22],
      ["autre", "Parfait, merci beaucoup. Les dattes sont-elles bien de la récolte 2026 ?", 30],
      ["moi", "Oui, cueillies cette semaine dans notre palmeraie de Tozeur, à pleine maturité.", 41],
      ["autre", "Merci pour toutes ces précisions !", 60],
    ],
  }),
  conversation({
    id: "cvf-2",
    interlocuteur: "Youssef K. — Sfax",
    interlocuteurInitiales: "YK",
    couleur: "palm",
    sujet: "Commande en gros",
    produitNom: "Deglet Nour Extra branchée",
    nonLus: 1,
    debut: "2026-10-16T09:00:00+01:00",
    bruts: [
      ["autre", "Bonjour, je tiens une pâtisserie à Sfax. Faites-vous des prix pour 50 kg ?", 0],
      ["moi", "Bonjour Youssef, oui : à partir de 20 kg nous proposons -12 %. Quelle qualité vous intéresse ?", 45],
      ["autre", "De la Catégorie I suffirait. Pouvez-vous livrer avant le 25 ?", 60],
    ],
  }),
  conversation({
    id: "cvf-3",
    interlocuteur: "Ines B. — Sousse",
    interlocuteurInitiales: "IB",
    couleur: "date",
    sujet: "Retour sur la livraison",
    nonLus: 0,
    debut: "2026-10-12T15:00:00+01:00",
    bruts: [
      ["autre", "Quelques dattes un peu sèches au bout des branches, sinon parfait.", 0],
      ["moi", "Merci Ines pour ce retour. Nous trions encore plus finement les extrémités désormais.", 30],
      ["autre", "Merci pour votre réactivité !", 40],
    ],
  }),
];
