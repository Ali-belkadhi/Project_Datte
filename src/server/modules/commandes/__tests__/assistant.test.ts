// MODULE C — IA-C : les 5 scénarios d'acceptation (§12.5) sur les outils et le mode local.
import { describe, expect, it, vi } from "vitest";
import type { ProduitAvecVendeur } from "@/types/domain";

const COMMANDES: Record<string, string> = { "DGL-2026-000123": "client-1", "DGL-2026-000150": "client-2" };

const produit = (id: string, nom: string, variete: string, bio: boolean, prix: number) =>
  ({
    produit: { id, nom, slug: id, typeProduit: "DATTE", variete, bio, prixParKg: prix, stockGrammes: 50_000, visuel: { type: "datte" } },
    vendeur: { id: "f1", slug: "f1", nomBoutique: "Palmeraie", verifie: true, region: "TOZEUR", couleur: "amber" },
  }) as unknown as ProduitAvecVendeur;
const CATALOGUE = [produit("p1", "Deglet Nour bio", "deglet-nour", true, 24_900), produit("p2", "Deglet Nour", "deglet-nour", false, 18_000), produit("p3", "Alig", "alig", false, 15_000)];

const appels = vi.hoisted(() => ({ recherche: [] as unknown[] }));

vi.mock("@/server/contracts/catalogue", () => ({
  rechercherProduits: async (f: { varietes?: string[]; prixMax?: number; bio?: boolean }) => {
    appels.recherche.push(f);
    return CATALOGUE.filter(
      ({ produit: p }) =>
        (!f.varietes || f.varietes.includes((p as { variete: string }).variete)) &&
        (!f.bio || p.bio) &&
        (!f.prixMax || (p as { prixParKg: number }).prixParKg <= f.prixMax),
    );
  },
  infosVariete: async (slug: string) => ({ slug, nom: slug === "alig" ? "Alig" : "Kenta", description: `Fiche ${slug}`, origine: "Tozeur" }),
}));
vi.mock("../repositories/mongo", () => ({
  db: {
    commandes: async () => ({ findOne: async ({ clientId }: { clientId: string }) => ({ numero: Object.keys(COMMANDES).find((n) => COMMANDES[n] === clientId) }) }),
  },
}));
// suiviPourClient filtre sur le client : une commande d'un autre client est introuvable
vi.mock("../services/commandes", () => ({
  suiviPourClient: async (clientId: string, numero: string) =>
    COMMANDES[numero] === clientId ? { numero, sousCommandes: [{ numero: `${numero}-A`, statut: "EXPEDIEE", fournisseurNom: "Palmeraie", etapes: [{ cle: "expediee", libelle: "Expédiée", etat: "terminee" }] }] } : null,
}));
vi.mock("@/lib/ai", () => ({ iaDisponible: () => false, modelesIA: () => [] }));
vi.mock("@/server/contracts/comptes", () => ({ journaliser: async () => undefined }));

const { creerOutilsAssistant, planLocal } = await import("../services/assistant-ia");
const outils = creerOutilsAssistant("client-1");
const ctx = { toolCallId: "t", messages: [] } as never;

describe("IA-C — outils de l'assistant", () => {
  it("1. recherche filtrée : variété + bio + prix max (DT → millimes)", async () => {
    const r = (await outils.rechercherProduits.execute!({ variete: "Deglet Nour", bio: true, prixMaxDT: 25 }, ctx)) as ProduitAvecVendeur[];
    expect(r.map((x) => x.produit.id)).toEqual(["p1"]);
    expect(appels.recherche.at(-1)).toMatchObject({ varietes: ["deglet-nour"], bio: true, prixMax: 25_000 });
  });

  it("2. explication de variété", async () => {
    expect(await outils.infosVariete.execute!({ variete: "alig" }, ctx)).toMatchObject({ slug: "alig", nom: "Alig" });
    expect(await outils.infosVariete.execute!({ variete: "inconnue" }, ctx)).toHaveProperty("erreur");
  });

  it("3. ajout au panier : outil SANS execute (confirmation obligatoire côté client)", () => {
    expect(outils.ajouterAuPanier.execute).toBeUndefined();
  });

  it("4. suivi de la commande du client connecté", async () => {
    const r = await outils.suivreCommande.execute!({ numero: "DGL-2026-000123" }, ctx);
    expect(r).toMatchObject({ numero: "DGL-2026-000123", colis: [{ statut: "EXPEDIEE" }] });
    expect(await outils.suivreCommande.execute!({}, ctx)).toMatchObject({ numero: "DGL-2026-000123" });
  });

  it("5. refus d'accéder à la commande d'un autre client", async () => {
    const r = await outils.suivreCommande.execute!({ numero: "DGL-2026-000150" }, ctx);
    expect(r).toHaveProperty("erreur");
    expect(r).not.toHaveProperty("colis");
  });

  it("un visiteur non connecté ne peut suivre aucune commande", async () => {
    expect(await creerOutilsAssistant(null).suivreCommande.execute!({ numero: "DGL-2026-000123" }, ctx)).toHaveProperty("erreur");
  });
});

describe("IA-C — mode local (sans clé ou en repli)", () => {
  it("recherche : comprend variété, bio et budget", async () => {
    const { appels: a } = await planLocal("Deglet Nour bio à moins de 30 DT", "client-1");
    expect(a[0]).toMatchObject({ outil: "rechercherProduits", input: { variete: "Deglet Nour", bio: true, prixMaxDT: 30 } });
  });

  it("ajout : propose l'ajout (sans résultat) avec un poids au pas de 0,5 kg", async () => {
    const { appels: a } = await planLocal("Ajoute 2 kg de Deglet Nour au panier", "client-1");
    const ajout = a.find((x) => x.outil === "ajouterAuPanier");
    expect(ajout).toMatchObject({ input: { quantiteGrammes: 2000 } });
    expect(ajout?.output).toBeUndefined();
  });

  it("comparaison de deux variétés", async () => {
    const { appels: a } = await planLocal("Quelle différence entre Alig et Kenta ?", "client-1");
    expect(a.filter((x) => x.outil === "infosVariete")).toHaveLength(2);
  });

  it("suivi : la commande d'un autre client est refusée", async () => {
    const { texte, appels: a } = await planLocal("Où est la commande DGL-2026-000150 ?", "client-1");
    expect(a[0].output).toHaveProperty("erreur");
    expect(texte).toMatch(/Aucune commande/);
  });
});
