// E2E — parcours d'achat complet sur l'application intégrée (modules A, B et C).
// Prérequis : base amorcée (`npm run seed`), paiement par carte simulé (sans clé Stripe).
import { expect, test, type Page } from "@playwright/test";
import { MongoClient } from "mongodb";

const MOT_DE_PASSE = "Admin123!";
const PRODUIT = { id: "", slug: "", nom: "Deglet Nour Extra" };
let numero = "";
let stockAvant = 0;

async function base<T>(fn: (db: ReturnType<MongoClient["db"]>) => Promise<T>) {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla_integration";
  const c = await MongoClient.connect(uri);
  try {
    return await fn(c.db());
  } finally {
    await c.close();
  }
}

async function connexion(page: Page, email: string) {
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="motDePasse"]').fill(MOT_DE_PASSE);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test.describe.serial("parcours commande", () => {
  test.setTimeout(240_000);

  test.beforeAll(async () => {
    const p = await base((db) => db.collection("products").findOne({ name: PRODUIT.nom }));
    expect(p, "produit amorcé par npm run seed").toBeTruthy();
    PRODUIT.id = String(p!._id);
    PRODUIT.slug = `deglet-nour-extra-${PRODUIT.id}`;
    stockAvant = Number(p!.stock);
  });

  test("visiteur : ajout au panier puis connexion au moment de commander", async ({ page }) => {
    await page.goto(`/produit/${PRODUIT.slug}`);
    await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
    await expect(page.getByText("Ajouté au panier").first()).toBeVisible({ timeout: 30_000 });

    await page.goto("/panier");
    await expect(page.getByText(PRODUIT.nom).first()).toBeVisible({ timeout: 30_000 });

    await page.getByRole("link", { name: "Passer la commande" }).first().click();
    await expect(page).toHaveURL(/\/connexion\?callbackUrl=%2Fcommande/, { timeout: 30_000 });
    await connexion(page, "client1@degla.test");
    await expect(page).toHaveURL(/\/commande$/, { timeout: 60_000 });

    // le panier invité a suivi le client (fusion EF-30)
    await expect(page.getByRole("link", { name: "Panier, 1 article" })).toBeVisible({ timeout: 30_000 });
    const panier = await base((db) => db.collection("paniers").findOne({ "lignes.produitId": PRODUIT.id }));
    expect(panier?.proprietaire).not.toMatch(/^visiteur:/);
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /Continuer/ }).click();
    await page.getByRole("button", { name: /Confirmer et payer/ }).click();

    await expect(page).toHaveURL(/\/commande\/confirmation\?numero=DGL-/, { timeout: 60_000 });
    numero = new URL(page.url()).searchParams.get("numero")!;
    expect(numero).toMatch(/^DGL-\d{4}-\d{6}$/);

    // commande payée (paiement simulé), facture émise, stock réservé dans le catalogue (module B)
    const { commande, facture, produit } = await base(async (db) => ({
      commande: await db.collection("commandes").findOne({ numero }),
      facture: await db.collection("factures").findOne({ commandeNumero: numero }),
      produit: await db.collection("products").findOne({ name: PRODUIT.nom }),
    }));
    expect(commande?.statut).toBe("PAYEE");
    expect(facture).toBeTruthy();
    expect(Number(produit!.stock)).toBeCloseTo(stockAvant - 1, 3); // 1 kg par défaut

    await page.goto("/compte/commandes");
    await expect(page.getByText(numero).first()).toBeVisible({ timeout: 30_000 });
  });

  test("vendeur : accepte, prépare, expédie et livre le colis", async ({ page }) => {
    await page.goto("/connexion?callbackUrl=%2Fvendeur%2Fcommandes");
    await connexion(page, "fournisseur1@degla.test");
    await expect(page).toHaveURL(/\/vendeur\/commandes/, { timeout: 60_000 });
    await page.goto(`/vendeur/commandes/${numero}-A`);

    await page.getByRole("button", { name: "Accepter" }).first().click();
    await page.getByRole("button", { name: /Marquer « En préparation »/ }).first().click({ timeout: 30_000 });
    await page.getByRole("button", { name: "Expédier" }).first().click({ timeout: 30_000 });
    await page.getByLabel("Numéro de suivi").fill("ARX-TN-00000001");
    await page.getByRole("button", { name: "Confirmer l'expédition" }).click();
    await page.getByRole("button", { name: "Confirmer la livraison" }).first().click({ timeout: 30_000 });

    await expect
      .poll(async () => (await base((db) => db.collection("sousCommandes").findOne({ numero: `${numero}-A` })))?.statut, { timeout: 30_000 })
      .toBe("LIVREE");
    const colis = await base((db) => db.collection("sousCommandes").findOne({ numero: `${numero}-A` }));
    expect(colis!.historique.map((h: { nouveauStatut: string }) => h.nouveauStatut)).toEqual(["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"]);
    // le client a été notifié à chaque étape (module A)
    const notifications = await base((db) => db.collection("notifications").countDocuments({ type: "COMMANDE_STATUT" }));
    expect(notifications).toBeGreaterThan(0);
  });

  test("client : avis sur l'achat livré, note du produit mise à jour", async ({ page }) => {
    await page.goto(`/connexion?callbackUrl=${encodeURIComponent(`/compte/commandes/${numero}`)}`);
    await connexion(page, "client1@degla.test");
    await expect(page).toHaveURL(new RegExp(`/compte/commandes/${numero}`), { timeout: 60_000 });

    await page.getByRole("button", { name: "Laisser un avis" }).first().click();
    await page.getByRole("button", { name: "5 étoiles" }).click();
    await page.locator("#avis-texte").fill("Dattes moelleuses et très parfumées, livraison soignée.");
    await page.getByRole("button", { name: "Publier mon avis" }).click();

    await expect
      .poll(async () => (await base((db) => db.collection("avis").findOne({ ligneCommandeId: `${numero}-A-1` })))?.note, { timeout: 30_000 })
      .toBe(5);
    // note moyenne et nombre d'avis du produit (module B) recalculés sur les avis visibles
    const { visibles, produit } = await base(async (db) => ({
      visibles: await db.collection("avis").find({ produitId: PRODUIT.id, statut: "VISIBLE" }).toArray(),
      produit: await db.collection("products").findOne({ name: PRODUIT.nom }),
    }));
    const moyenne = Math.round((visibles.reduce((a, v) => a + v.note, 0) / visibles.length) * 10) / 10;
    expect(produit!.reviewCount).toBe(visibles.length);
    expect(produit!.averageRating).toBe(moyenne);
  });

  test("assistant IA-C : répond et propose des produits réels", async ({ page }) => {
    await page.goto("/assistant");
    await page.getByLabel("Votre question").fill("Je cherche de la Deglet Nour");
    await page.getByRole("button", { name: "Envoyer" }).click();
    await expect(page.getByText("Deglet Nour", { exact: false }).nth(1)).toBeVisible({ timeout: 60_000 });
  });

  test("vendeur : achat d'un pack de crédits 3D via PaiementService", async ({ page }) => {
    const fournisseur = await base((db) => db.collection("fournisseurs").findOne({ nomBoutique: "Palmeraie Ben Amor" }));
    const fid = String(fournisseur!._id);
    const avant = (await base((db) => db.collection("creditsoldes").findOne({ fournisseurId: fid })))?.solde ?? 0;

    await page.goto("/connexion?callbackUrl=%2Fvendeur%2Fcredits");
    await connexion(page, "fournisseur1@degla.test");
    await expect(page).toHaveURL(/\/vendeur\/credits/, { timeout: 60_000 });
    await page.getByRole("button", { name: /^Acheter/ }).first().click();
    await page.getByRole("button", { name: /^Payer/ }).click();

    await expect
      .poll(async () => (await base((db) => db.collection("creditsoldes").findOne({ fournisseurId: fid })))?.solde ?? 0, { timeout: 30_000 })
      .toBeGreaterThan(avant);
    const paiement = await base((db) => db.collection("paiements").findOne({ "objet.type": "CREDITS_3D" }, { sort: { creeLe: -1 } }));
    expect(paiement?.statut).toBe("REUSSI");
  });

  test("admin : vue globale des commandes, codes promo, litiges", async ({ page }) => {
    await page.goto("/connexion?callbackUrl=%2Fadmin%2Fcommandes");
    await connexion(page, "admin@degla.tn");
    await expect(page).toHaveURL(/\/admin\/commandes/, { timeout: 60_000 });
    await expect(page.getByText(numero).first()).toBeVisible({ timeout: 30_000 });
    for (const [chemin, texte] of [["/admin/codes-promo", "DEGLA10"], ["/admin/litiges", "Litiges"]]) {
      await page.goto(chemin);
      await expect(page.getByText(texte).first()).toBeVisible({ timeout: 30_000 });
    }
  });
});
