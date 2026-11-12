// E2E — boutique, photos produit, 3D au catalogue, crédits 3D par fournisseur, avis depuis la fiche, notifications détaillées.
// Prérequis : base amorcée (`npm run seed:reset`), paiement simulé (sans clé Stripe).
import { expect, test, type Page } from "@playwright/test";
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

const URI = () => process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla_e2e";
async function base<T>(fn: (db: ReturnType<MongoClient["db"]>) => Promise<T>) {
  const c = await MongoClient.connect(URI());
  try {
    return await fn(c.db());
  } finally {
    await c.close();
  }
}

async function connexion(page: Page, email: string, cible = "/") {
  await page.goto(`/connexion?callbackUrl=${encodeURIComponent(cible)}`);
  await page.waitForFunction(() => Object.keys(document.querySelector("form") ?? {}).some((k) => k.startsWith("__react")), null, { timeout: 60_000 });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="motDePasse"]').fill("Admin123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/connexion"), { timeout: 60_000 });
}

const PRODUIT = { id: "", slug: "" };

test.describe.serial("corrections", () => {
  test.setTimeout(300_000);

  test.beforeAll(async () => {
    // « Rob de datte » (Palmeraie Ben Amor) reçoit une vraie photo et un modèle 3D stockés dans GridFS
    await base(async (db) => {
      const p = await db.collection("products").findOne({ name: "Rob de datte" });
      PRODUIT.id = String(p!._id);
      PRODUIT.slug = `rob-de-datte-${PRODUIT.id}`;
      const b = new GridFSBucket(db, { bucketName: "media" });
      const ecrire = (nom: string, type: string, data: Buffer) =>
        new Promise<void>((ok, ko) => b.openUploadStream(nom, { metadata: { contentType: type } }).once("finish", () => ok()).once("error", ko).end(data));
      const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
      await ecrire("images/e2e-rob.png", "image/png", png);
      await db.collection("products").updateOne({ _id: new ObjectId(PRODUIT.id) }, { $set: { imageUrl: "/api/media/images/e2e-rob.png", modelUrl: "/api/media/models/e2e-rob.glb" } });
    });
  });

  test("catalogue : vraie photo du produit et badge « Vue 3D »", async ({ page }) => {
    await page.goto("/catalogue");
    const carte = page.locator("article", { hasText: "Rob de datte" }).first();
    await expect(carte.locator('img[src="/api/media/images/e2e-rob.png"]')).toBeVisible({ timeout: 30_000 });
    await expect(carte.getByText("Vue 3D")).toBeVisible();
  });

  test("boutique publique complète, avec produits et avis", async ({ page }) => {
    await page.goto("/boutique/palmeraie-ben-amor");
    await expect(page.getByRole("tab", { name: /Produits \([1-9]/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("tab", { name: /Avis \(\d+\)/ })).toBeVisible();
    await expect(page.locator("article", { hasText: "Rob de datte" }).first()).toBeVisible();
  });

  test("boutique non validée : introuvable pour un visiteur, aperçu pour son propriétaire", async ({ page }) => {
    // rendu en streaming : le code HTTP reste 200, la page affichée est celle « introuvable »
    await page.goto("/boutique/oasis-gabes");
    await expect(page.getByText("Erreur 404").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Aperçu de votre boutique")).toHaveCount(0);
    await connexion(page, "fournisseur3@degla.test", "/vendeur");
    await page.goto("/boutique/oasis-gabes");
    await expect(page.getByText("Aperçu de votre boutique")).toBeVisible({ timeout: 30_000 });
  });

  test("crédits 3D : solde propre au fournisseur, achat crédité", async ({ page }) => {
    const fid = String((await base((db) => db.collection("fournisseurs").findOne({ nomBoutique: "Palmeraie Ben Amor" })))!._id);
    await connexion(page, "fournisseur1@degla.test", "/vendeur/credits");
    await page.goto("/vendeur/credits");
    const initial = await base((db) => db.collection("creditsoldes").findOne({ fournisseurId: fid }));
    expect(initial?.solde).toBe(5); // crédits offerts à l'inscription, pas le solde de démonstration
    await page.getByRole("button", { name: /^Acheter/ }).first().click();
    await page.getByRole("button", { name: /^Payer/ }).click();
    await expect.poll(async () => (await base((db) => db.collection("creditsoldes").findOne({ fournisseurId: fid })))?.solde, { timeout: 30_000 }).toBeGreaterThan(5);
    const notif = await base((db) => db.collection("notifications").find({ type: "ACHAT_CREDITS_CONFIRME" }).sort({ _id: -1 }).limit(1).next());
    expect(notif?.contenu).toMatch(/crédits 3D ont été ajoutés/);
  });

  test("avis depuis la fiche produit après livraison, notifications détaillées", async ({ page, browser }) => {
    // commande du client
    await connexion(page, "client3@degla.test", `/produit/${PRODUIT.slug}`);
    await page.goto(`/produit/${PRODUIT.slug}`);
    await page.getByRole("tab", { name: /Avis/ }).click();
    await expect(page.getByText("vous pourrez noter ce produit dès la livraison")).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
    await expect(page.getByText("Ajouté au panier").first()).toBeVisible({ timeout: 30_000 });
    await page.goto("/commande");
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /Continuer/ }).click();
    await page.getByRole("button", { name: /Confirmer et payer/ }).click();
    await page.waitForURL(/\/commande\/confirmation\?numero=DGL-/, { timeout: 60_000 });
    const numero = new URL(page.url()).searchParams.get("numero")!;

    // le vendeur livre
    const vendeur = await (await browser.newContext()).newPage();
    await connexion(vendeur, "fournisseur1@degla.test", "/vendeur/commandes");
    await vendeur.goto(`/vendeur/commandes/${numero}-A`);
    await vendeur.getByRole("button", { name: "Accepter" }).first().click();
    await vendeur.getByRole("button", { name: /Marquer « En préparation »/ }).first().click({ timeout: 30_000 });
    await vendeur.getByRole("button", { name: "Expédier" }).first().click({ timeout: 30_000 });
    await vendeur.getByLabel("Numéro de suivi").fill("ARX-TN-E2E");
    await vendeur.getByRole("button", { name: "Confirmer l'expédition" }).click();
    await vendeur.getByRole("button", { name: "Confirmer la livraison" }).first().click({ timeout: 30_000 });
    await expect.poll(async () => (await base((db) => db.collection("sousCommandes").findOne({ numero: `${numero}-A` })))?.statut, { timeout: 30_000 }).toBe("LIVREE");

    // notifications détaillées du client
    const notifs = await base((db) => db.collection("notifications").find({ type: "COMMANDE_STATUT", lien: `/compte/commandes/${numero}` }).toArray());
    const titres = notifs.map((n) => n.titre);
    expect(titres).toEqual(expect.arrayContaining(["Paiement confirmé", "Commande acceptée", "Colis en préparation", "Colis expédié", "Colis livré"]));
    expect(notifs.find((n) => n.titre === "Colis expédié")?.contenu).toMatch(/ARX-TN-E2E/);

    // avis laissé directement depuis la fiche produit
    await page.goto(`/produit/${PRODUIT.slug}`);
    await page.getByRole("tab", { name: /Avis/ }).click();
    await page.getByRole("button", { name: "Laisser un avis" }).click();
    await page.getByRole("button", { name: "5 étoiles" }).click();
    await page.locator("#avis-texte").fill("Rob délicieux, laissé depuis la fiche produit.");
    await page.getByRole("button", { name: "Publier mon avis" }).click();
    // enregistré en base, fenêtre fermée, puis affiché dans la liste des avis de la fiche
    await expect.poll(async () => (await base((db) => db.collection("avis").findOne({ ligneCommandeId: `${numero}-A-1` })))?.note, { timeout: 30_000 }).toBe(5);
    await expect(page.locator("#avis-texte")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.getByRole("tabpanel").getByText("Rob délicieux, laissé depuis la fiche produit.")).toBeVisible({ timeout: 30_000 });

    // il apparaît aussi sur la boutique
    await page.goto("/boutique/palmeraie-ben-amor");
    await page.getByRole("tab", { name: /Avis/ }).click();
    await expect(page.getByText("Rob délicieux, laissé depuis la fiche produit.")).toBeVisible({ timeout: 30_000 });
  });
});
