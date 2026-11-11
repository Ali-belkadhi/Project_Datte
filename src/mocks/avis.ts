// données de démonstration — 40 avis fictifs (aucun témoignage réel)
import type { Avis } from "@/types/domain";
import { PRODUITS } from "./produits";

type AvisBrut = [produitId: string, auteur: string, note: number, commentaire: string, jour: number, reponse?: string];

const BRUTS: AvisBrut[] = [
  ["p01", "Sarra M.", 5, "Des dattes translucides comme on n'en trouve plus en ville. Le régime est arrivé intact, très bien emballé.", 2, "Merci Sarra ! Ravis que le régime ait fait bon voyage jusqu'à Tunis."],
  ["p01", "Youssef K.", 5, "Goût de miel incroyable, chaque datte est parfaite. Je recommande les yeux fermés.", 4],
  ["p01", "Ines B.", 4, "Très bonnes dattes, quelques-unes un peu sèches au bout des branches mais rien de grave.", 6, "Merci pour votre retour, nous trions encore plus finement les extrémités."],
  ["p01", "Mehdi T.", 5, "Commandé pour l'Aïd, toute la famille a adoré. La vue 3D m'avait convaincu, le rendu réel est encore mieux.", 9],
  ["p01", "Rania H.", 5, "Expédition rapide depuis Tozeur, reçues en 48 h à Sfax.", 12],
  ["p02", "Karim O.", 5, "Excellent rapport qualité-prix pour de la Deglet Nour de tous les jours.", 3],
  ["p02", "Nour E.", 4, "Bon calibre, bien moelleuses. Le sachet pourrait être refermable.", 7, "Bonne idée, nous testons des sachets zip pour la prochaine récolte."],
  ["p02", "Amine S.", 4, "Bonnes dattes, livraison correcte.", 15],
  ["p03", "Leila G.", 5, "La barquette kraft est très jolie, parfaite pour offrir.", 5],
  ["p03", "Hichem R.", 5, "Bio et délicieuses, je reprendrai.", 11],
  ["p04", "Salma D.", 5, "Les premières de la saison, juteuses et fraîches. Un vrai bonheur.", 1],
  ["p04", "Walid M.", 4, "Très bonnes mais à consommer vite, comme indiqué sur la fiche.", 3],
  ["p05", "Asma C.", 4, "Pratiques pour la pâtisserie, bien dénoyautées.", 8],
  ["p05", "Fares B.", 3, "Bon goût, mais quelques dattes un peu écrasées à la livraison.", 13, "Désolés pour ce désagrément, nous renforçons le calage des barquettes."],
  ["p06", "Meriem A.", 5, "Énormes et fondantes, on dirait du caramel. Un vrai dessert.", 2],
  ["p06", "Oussama L.", 5, "Les meilleures Medjool que j'ai goûtées, calibre impressionnant.", 6],
  ["p06", "Dorra F.", 4, "Excellentes, le prix est élevé mais justifié.", 10],
  ["p07", "Bilel N.", 5, "Offert à mon directeur, très bel effet. La boîte est soignée.", 4, "Merci Bilel, c'est exactement l'usage pour lequel nous l'avons pensée."],
  ["p07", "Yasmine Z.", 5, "Présentation magnifique, dattes parfaites.", 9],
  ["p08", "Tarek J.", 5, "L'Alig comme chez ma grand-mère à Tozeur. Parfaite avec le lben.", 3],
  ["p08", "Mouna K.", 4, "Ferme et peu sucrée, exactement ce que je cherchais.", 14],
  ["p09", "Skander H.", 4, "Belle branche, dattes bien conservées.", 5],
  ["p10", "Emna S.", 4, "Idéales pour les goûters des enfants, pas collantes.", 7],
  ["p11", "Nabil R.", 5, "Variété rare et délicieuse, dommage qu'elle soit déjà en rupture.", 8, "Merci Nabil, la prochaine cueillette arrive fin octobre."],
  ["p12", "Hela M.", 5, "Croquantes et fraîches, ça me rappelle les étés à Gabès.", 2],
  ["p12", "Achraf B.", 4, "Surprenant pour qui ne connaît pas la datte fraîche. À essayer.", 6],
  ["p13", "Sonia T.", 4, "Très juteuses, parfaites pour ma pâte maison.", 9],
  ["p14", "Ridha A.", 3, "Sèches comme annoncé, bien pour moudre mais pas pour grignoter.", 16],
  ["p15", "Ichraf D.", 5, "Parfaites pour les makroudh, et le prix est imbattable.", 4],
  ["p17", "Aziz F.", 4, "Jus très doux, à couper avec un peu d'eau pétillante.", 5],
  ["p17", "Olfa K.", 5, "Les enfants l'adorent, sans sucre ajouté en plus.", 12],
  ["p18", "Malek B.", 5, "La pointe d'orange est géniale, sur des crêpes c'est un régal.", 3],
  ["p18", "Rim S.", 4, "Bonne confiture, un peu sucrée à mon goût.", 10, "Merci Rim, une version allégée est à l'étude."],
  ["p19", "Khadija M.", 5, "Ghars de grande qualité, mes makroudh n'ont jamais été aussi bons.", 6],
  ["p20", "Slim G.", 5, "Le vrai rob de Gabès, épais et parfumé. Sur l'assida, c'est parfait.", 2, "Merci Slim ! Le feu de bois fait toute la différence."],
  ["p20", "Wiem H.", 5, "Exceptionnel. Je n'achète plus que celui-ci.", 8],
  ["p21", "Lotfi C.", 5, "Remplace le sucre dans mon café, très parfumé.", 4],
  ["p22", "Ahlem J.", 4, "Bonne alternative au café le soir, goût de cacao surprenant.", 7],
  ["p23", "Mariem T.", 5, "Coffret superbe, très apprécié comme cadeau de mariage.", 5],
  ["p24", "Seifeddine A.", 5, "Fourrées généreusement, parfum de fleur d'oranger délicat.", 3],
];

const dateIlYa = (jours: number) =>
  new Date(Date.UTC(2026, 9, 18 - jours, 9 + (jours % 8), 15)).toISOString();

export const AVIS: Avis[] = BRUTS.map(([produitId, auteur, note, commentaire, jour, reponse], i) => {
  const produit = PRODUITS.find((p) => p.id === produitId)!;
  return {
    id: `av-${String(i + 1).padStart(2, "0")}`,
    produitId,
    produitNom: produit.nom,
    fournisseurId: produit.fournisseurId,
    auteur,
    note,
    commentaire,
    creeLe: dateIlYa(jour),
    reponseFournisseur: reponse,
    reponduLe: reponse ? dateIlYa(Math.max(0, jour - 1)) : undefined,
    achatVerifie: i % 7 !== 3,
  };
});
