// données de démonstration — utilisateurs et adresses fictifs
import type { Adresse, Utilisateur } from "@/types/domain";

export const UTILISATEUR_ACHETEUR: Utilisateur = {
  id: "u-sarra",
  prenom: "Sarra",
  nom: "Mejri",
  email: "sarra.mejri@exemple.tn",
  telephone: "+216 22 345 678",
  telephoneVerifie: true,
  role: "CLIENT",
  ville: "Tunis",
  initiales: "SM",
};

export const UTILISATEUR_VENDEUR: Utilisateur = {
  id: "u-hedi",
  prenom: "Hédi",
  nom: "Ben Amor",
  email: "hedi@palmeraie-ben-amor.tn",
  telephone: "+216 98 112 233",
  telephoneVerifie: true,
  role: "FOURNISSEUR",
  ville: "Tozeur",
  initiales: "HB",
  fournisseurId: "f-ben-amor",
};

export const UTILISATEUR_ADMIN: Utilisateur = {
  id: "u-admin",
  prenom: "Équipe",
  nom: "DEGLA",
  email: "equipe@degla.tn",
  telephoneVerifie: true,
  role: "ADMIN",
  ville: "Tunis",
  initiales: "DG",
};

export const ADRESSES: Adresse[] = [
  {
    id: "adr-maison",
    libelle: "Maison",
    destinataire: "Sarra Mejri",
    ligne1: "12, rue du Lac Léman",
    ligne2: "Résidence Les Jasmins, apt. 4",
    ville: "Les Berges du Lac",
    gouvernorat: "TUNIS",
    codePostal: "1053",
    telephone: "+216 22 345 678",
    parDefaut: true,
  },
  {
    id: "adr-bureau",
    libelle: "Bureau",
    destinataire: "Sarra Mejri",
    ligne1: "Immeuble Carthage Center, 3ᵉ étage",
    ligne2: "Avenue Mohamed V",
    ville: "Tunis",
    gouvernorat: "TUNIS",
    codePostal: "1002",
    telephone: "+216 22 345 678",
    parDefaut: false,
  },
  {
    id: "adr-parents",
    libelle: "Chez mes parents",
    destinataire: "Mounir Mejri",
    ligne1: "45, avenue Habib Bourguiba",
    ville: "Sousse",
    gouvernorat: "SOUSSE",
    codePostal: "4000",
    telephone: "+216 73 221 904",
    parDefaut: false,
  },
];
