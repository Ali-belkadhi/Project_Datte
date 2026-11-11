// MODULE C — tests unitaires : panier, scission par fournisseur, validation (EF-31, EF-32).
import { describe, expect, it } from "vitest";
import type { LignePanier } from "@/types/domain";
import { LIVRAISON } from "@/lib/constants";
import { totalLigne } from "@/lib/format";
import { scinderParFournisseur, totauxPanier } from "@/lib/panier";
import { lignePanierSchema, majLignePanierSchema } from "@/lib/validation/commandes";

const ligne = (l: Partial<LignePanier> & Pick<LignePanier, "produitId" | "fournisseurId" | "prix">): LignePanier => ({
  id: l.produitId,
  slug: l.produitId,
  nom: `Produit ${l.produitId}`,
  typeProduit: l.quantiteUnites ? "DERIVE" : "DATTE",
  visuel: "datte" as LignePanier["visuel"],
  fournisseurNom: `Boutique ${l.fournisseurId}`,
  fournisseurVerifie: true,
  stockMax: 100_000,
  ...l,
});

describe("totalLigne (millimes, poids en grammes)", () => {
  it("datte : prix/kg × poids", () => {
    expect(totalLigne(24_900, 2000)).toBe(49_800); // 24,900 DT/kg × 2 kg
    expect(totalLigne(19_500, 500)).toBe(9_750); // 0,5 kg
  });
  it("dérivé : prix unitaire × quantité", () => {
    expect(totalLigne(12_000, undefined, 3)).toBe(36_000);
  });
});

describe("scinderParFournisseur (EF-32)", () => {
  const lignes = [
    ligne({ produitId: "p1", fournisseurId: "A", prix: 20_000, quantiteGrammes: 1000 }),
    ligne({ produitId: "p2", fournisseurId: "B", prix: 10_000, quantiteUnites: 2 }),
    ligne({ produitId: "p3", fournisseurId: "A", prix: 30_000, quantiteGrammes: 2000 }),
  ];

  it("crée une sous-commande par fournisseur", () => {
    const groupes = scinderParFournisseur(lignes);
    expect(groupes.map((g) => g.fournisseurId)).toEqual(["A", "B"]);
    expect(groupes[0].lignes.map((l) => l.produitId)).toEqual(["p1", "p3"]);
  });

  it("calcule le sous-total et les frais de livraison propres à chaque vendeur", () => {
    const [a, b] = scinderParFournisseur(lignes);
    expect(a.sousTotal).toBe(80_000); // 20 + 60 DT
    expect(a.frais).toBe(0); // livraison offerte dès 80 DT
    expect(b.sousTotal).toBe(20_000);
    expect(b.frais).toBe(LIVRAISON.standard.prix);
    expect(b.resteAvantGratuite).toBe(LIVRAISON.gratuiteDes - 20_000);
  });

  it("total = sous-total + livraison − remise, jamais négatif", () => {
    const t = totauxPanier(lignes, 5_000);
    expect(t.total).toBe(100_000 + LIVRAISON.standard.prix - 5_000);
    expect(totauxPanier(lignes, 10_000_000).total).toBe(0);
  });
});

describe("validation des quantités (EF-31 : pas de 0,5 kg)", () => {
  it("accepte 0,5 kg, 1 kg, 2,5 kg", () => {
    for (const g of [500, 1000, 2500]) expect(lignePanierSchema.safeParse({ produitId: "p1", quantiteGrammes: g }).success).toBe(true);
  });
  it("refuse un poids hors pas, nul ou trop grand", () => {
    for (const g of [250, 750, 1200, 0, 60_000]) expect(lignePanierSchema.safeParse({ produitId: "p1", quantiteGrammes: g }).success).toBe(false);
  });
  it("exige un poids OU des unités, pas les deux", () => {
    expect(lignePanierSchema.safeParse({ produitId: "p1" }).success).toBe(false);
    expect(lignePanierSchema.safeParse({ produitId: "p1", quantiteGrammes: 500, quantiteUnites: 1 }).success).toBe(false);
    expect(lignePanierSchema.safeParse({ produitId: "p1", quantiteUnites: 2 }).success).toBe(true);
  });
  it("mise à jour : 0 retire la ligne, sinon même pas de 0,5 kg", () => {
    expect(majLignePanierSchema.safeParse({ ligneId: "p1", quantiteGrammes: 0 }).success).toBe(true);
    expect(majLignePanierSchema.safeParse({ ligneId: "p1", quantiteGrammes: 1500 }).success).toBe(true);
    expect(majLignePanierSchema.safeParse({ ligneId: "p1", quantiteGrammes: 1300 }).success).toBe(false);
  });
});
