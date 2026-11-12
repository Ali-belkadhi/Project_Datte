// MODULE C — tests unitaires des services : machine à états (EF-35/36), codes promo (EF-33), commission (EF-19).
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CodePromoDoc } from "../repositories/mongo";
import type { GroupePanier } from "@/lib/panier";
import type { StatutSousCommande } from "@/types/enums";

/* ------------------------------ Doublures ------------------------------- */

const etat = vi.hoisted(() => ({
  code: null as CodePromoDoc | null,
  fournisseur: null as { tauxCommission?: number } | null,
  parametres: { tauxCommission: 8 } as { tauxCommission: number } | null,
}));

vi.mock("../repositories/mongo", () => ({
  db: { codesPromo: async () => ({ findOne: async ({ code }: { code: string }) => (etat.code?.code === code ? etat.code : null) }) },
  SANS_ID: {},
  prochainNumero: async () => 1,
}));
vi.mock("@/server/contracts/comptes", () => ({
  getUtilisateurCourant: async () => ({ id: "u1", role: "CLIENT" }),
  getFournisseur: async () => etat.fournisseur,
  getParametresPlateforme: async () => {
    if (!etat.parametres) throw new Error("indisponible");
    return etat.parametres;
  },
  notifier: async () => undefined,
}));
vi.mock("@/server/contracts/catalogue", () => ({
  getProduitsPourPanier: async () => [],
  reserverStock: async () => ({}),
  libererStock: async () => ({}),
}));

const { TRANSITIONS, actionsPossibles } = await import("../services/commandes");
const { evaluerCodePromo } = await import("../services/codes-promo");
const { calculerCommission, tauxCommission, TAUX_COMMISSION_DEFAUT } = await import("../services/commission");

/* ---------------------------- Machine à états ---------------------------- */

describe("machine à états des sous-commandes (EF-35)", () => {
  it("suit le parcours nominal EN_ATTENTE → ACCEPTEE → EN_PREPARATION → EXPEDIEE → LIVREE", () => {
    const parcours: StatutSousCommande[] = ["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
    for (let i = 0; i < parcours.length - 1; i++) expect(TRANSITIONS[parcours[i]]).toContain(parcours[i + 1]);
  });

  it("annulation possible tant que le colis n'est pas expédié (EF-36)", () => {
    for (const s of ["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION"] as const) expect(TRANSITIONS[s]).toContain("ANNULEE");
    for (const s of ["EXPEDIEE", "LIVREE"] as const) expect(TRANSITIONS[s]).not.toContain("ANNULEE");
  });

  it("aucun retour en arrière ni sortie d'un état final", () => {
    expect(TRANSITIONS.LIVREE).toEqual(["REMBOURSEE"]);
    expect(TRANSITIONS.REMBOURSEE).toEqual([]);
    expect(TRANSITIONS.EXPEDIEE).not.toContain("EN_PREPARATION");
  });

  it("le refus n'est possible qu'avant acceptation", () => {
    const avecRefus = (Object.keys(TRANSITIONS) as StatutSousCommande[]).filter((s) => TRANSITIONS[s].includes("REFUSEE"));
    expect(avecRefus).toEqual(["EN_ATTENTE"]);
  });

  it("les actions vendeur proposées respectent les transitions", () => {
    const cible = { accepter: "ACCEPTEE", refuser: "REFUSEE", preparer: "EN_PREPARATION", expedier: "EXPEDIEE", livrer: "LIVREE" } as const;
    for (const s of Object.keys(TRANSITIONS) as StatutSousCommande[]) {
      for (const a of actionsPossibles(s)) {
        if (a === "bordereau") continue; // impression, pas une transition
        expect(TRANSITIONS[s]).toContain(cible[a]);
      }
    }
  });
});

/* ------------------------------- Codes promo ----------------------------- */

const groupe = (fournisseurId: string, sousTotal: number): GroupePanier => ({
  fournisseurId,
  fournisseurNom: fournisseurId,
  fournisseurVerifie: true,
  lignes: [],
  sousTotal,
  frais: 0,
  resteAvantGratuite: 0,
});
const code = (c: Partial<CodePromoDoc>): CodePromoDoc => ({
  code: "DEGLA10",
  type: "POURCENTAGE",
  valeur: 10,
  fournisseurId: null,
  montantMinimum: 0,
  debut: new Date(Date.now() - 864e5),
  fin: new Date(Date.now() + 864e5),
  utilisationsMax: null,
  utilisations: 0,
  actif: true,
  ...c,
});

describe("codes promo (EF-33)", () => {
  beforeEach(() => (etat.code = null));

  it("pourcentage global réparti au prorata entre les vendeurs", async () => {
    etat.code = code({});
    const r = await evaluerCodePromo(" degla10 ", [groupe("A", 60_000), groupe("B", 40_000)]);
    expect(r.valide).toBe(true);
    expect(r.remise).toBe(10_000);
    expect(r.parFournisseur).toEqual({ A: 6_000, B: 4_000 });
  });

  it("code d'un fournisseur : ne s'applique qu'à ses articles", async () => {
    etat.code = code({ fournisseurId: "B", type: "MONTANT_FIXE", valeur: 5_000 });
    const r = await evaluerCodePromo("DEGLA10", [groupe("A", 60_000), groupe("B", 40_000)]);
    expect(r.remise).toBe(5_000);
    expect(r.parFournisseur).toEqual({ B: 5_000 });
  });

  it("la remise ne dépasse jamais le montant concerné", async () => {
    etat.code = code({ type: "MONTANT_FIXE", valeur: 999_000 });
    expect((await evaluerCodePromo("DEGLA10", [groupe("A", 20_000)])).remise).toBe(20_000);
  });

  it("refuse un code inconnu, expiré, épuisé ou sous le minimum", async () => {
    const g = [groupe("A", 20_000)];
    expect((await evaluerCodePromo("INCONNU", g)).valide).toBe(false);
    etat.code = code({ fin: new Date(Date.now() - 1000) });
    expect((await evaluerCodePromo("DEGLA10", g)).message).toMatch(/expiré/);
    etat.code = code({ utilisationsMax: 3, utilisations: 3 });
    expect((await evaluerCodePromo("DEGLA10", g)).message).toMatch(/limite/);
    etat.code = code({ montantMinimum: 50_000 });
    expect((await evaluerCodePromo("DEGLA10", g)).message).toMatch(/Minimum/);
    etat.code = code({ fournisseurId: "Z" });
    expect((await evaluerCodePromo("DEGLA10", g)).valide).toBe(false);
  });
});

/* -------------------------------- Commission ----------------------------- */

describe("commission plateforme (EF-19)", () => {
  beforeEach(() => {
    etat.fournisseur = null;
    etat.parametres = { tauxCommission: 8 };
  });

  it("calcule la commission en millimes, arrondie", () => {
    expect(calculerCommission(100_000, 8)).toBe(8_000);
    expect(calculerCommission(12_345, 8)).toBe(988);
  });

  it("taux du fournisseur > taux de la plateforme > taux de secours", async () => {
    expect(await tauxCommission("f1")).toBe(8);
    etat.parametres = { tauxCommission: 10 };
    expect(await tauxCommission("f1")).toBe(10);
    etat.fournisseur = { tauxCommission: 5 };
    expect(await tauxCommission("f1")).toBe(5);
    etat.fournisseur = null;
    etat.parametres = null;
    expect(await tauxCommission("f1")).toBe(TAUX_COMMISSION_DEFAUT);
  });
});
