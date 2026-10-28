export type CurrentUser = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "CLIENT" | "FOURNISSEUR" | "ADMIN";
  langue: "FR" | "AR" | "EN";
  tokenVersion: number;
  statut: "ACTIF" | "SUSPENDU" | "SUPPRIME";
  emailVerifie: boolean;
};