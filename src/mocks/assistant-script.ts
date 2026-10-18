// données de démonstration — scénarios scriptés de l'assistant IA-C (aucun appel à un modèle)
import type { ScenarioAssistantSource } from "@/types/domain";

export const SCENARIOS_ASSISTANT: ScenarioAssistantSource[] = [
  {
    id: "recherche-deglet-bio",
    question: "2 kg de Deglet Nour bio à moins de 30 DT",
    declencheurs: ["deglet", "bio", "moins de", "chercher", "trouve"],
    reponse:
      "Voici trois Deglet Nour bio de la récolte 2026, toutes sous 30 DT le kilo. La branchée de Palmeraie Ben Amor est la mieux notée (4,9/5) : 2 kg reviennent à 51,000 DT.",
    resultat: { outil: "recherche", produitIds: ["p01", "p03", "p04"] },
    suite: "Souhaitez-vous que j'ajoute 2 kg de la Deglet Nour Extra branchée à votre panier ?",
  },
  {
    id: "ajout-panier",
    question: "Oui, ajoute 2 kg de la branchée",
    declencheurs: ["ajoute", "ajouter", "oui", "panier"],
    reponse: "Très bien. Je prépare l'ajout ; confirmez ci-dessous.",
    resultat: { outil: "ajout-panier", produitId: "p01", quantiteGrammes: 2000 },
  },
  {
    id: "comparatif-alig-kenta",
    question: "Quelle différence entre Alig et Kenta ?",
    declencheurs: ["différence", "difference", "alig", "kenta", "compar"],
    reponse:
      "Ce sont deux variétés du Djérid, mais très différentes en bouche. L'Alig est sombre, ferme et peu sucrée ; la Kenta est plus claire, semi-sèche et douce, avec des notes de noisette.",
    resultat: { outil: "varietes", varietes: ["alig", "kenta"] },
    suite: "Pour accompagner le lben, je vous conseille l'Alig ; pour un goûter, la Kenta.",
  },
  {
    id: "suivi-commande",
    question: "Où est ma commande ?",
    declencheurs: ["où est", "ou est", "commande", "suivi", "colis", "livraison"],
    reponse:
      "Votre commande DGL-2026-000123 est scindée en 2 colis. Celui des Délices de Nefta est en route avec Aramex ; celui de Palmeraie Ben Amor est en préparation et partira demain matin.",
    resultat: { outil: "suivi", commandeNumero: "DGL-2026-000123" },
  },
  {
    id: "idee-coffret",
    question: "Une idée de coffret cadeau",
    declencheurs: ["cadeau", "coffret", "offrir"],
    reponse:
      "Pour offrir, trois valeurs sûres : la boîte de Medjool Extra, le coffret « Oasis » assorti et les dattes fourrées aux amandes. Toutes sont livrées dans un emballage soigné.",
    resultat: { outil: "recherche", produitIds: ["p07", "p23", "p24"] },
    suite: "Voulez-vous que je vous indique les délais de livraison pour une date précise ?",
  },
];

export const REPONSE_GENERIQUE =
  "Je suis l'assistant de démonstration de DEGLA : je sais rechercher des dattes, comparer des variétés, suivre une commande et proposer des idées de cadeaux. Essayez l'une des suggestions ci-dessous.";

export const SUGGESTIONS_ASSISTANT = [
  "2 kg de Deglet Nour bio à moins de 30 DT",
  "Quelle différence entre Alig et Kenta ?",
  "Où est ma commande ?",
  "Une idée de coffret cadeau",
];
