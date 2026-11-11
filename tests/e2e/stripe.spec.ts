// E2E — paiement par carte sur la vraie page Stripe Checkout (mode test, carte 4242).
// Ignoré si STRIPE_CLE_SECRETE n'est pas définie (le paiement est alors simulé).
import { expect, test } from "@playwright/test";
import { MongoClient } from "mongodb";

test.skip(!process.env.STRIPE_CLE_SECRETE, "Stripe non configuré : paiement simulé");

test("commande payée par carte sur Stripe Checkout", async ({ page }) => {
  test.setTimeout(240_000);
  const c = await MongoClient.connect(process.env.MONGODB_URI!);
  const p = await c.db().collection("products").findOne({ name: "Sirop de datte" });
  await c.close();

  await page.goto("/connexion?callbackUrl=%2Fpanier");
  await page.locator('input[name="email"]').fill("client2@degla.test");
  await page.locator('input[name="motDePasse"]').fill("Admin123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/panier/, { timeout: 60_000 });

  await page.goto(`/produit/sirop-de-datte-${p!._id}`);
  await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
  await expect(page.getByText("Ajouté au panier").first()).toBeVisible({ timeout: 30_000 });
  await page.goto("/commande");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByRole("button", { name: /Confirmer et payer/ }).click();

  // page hébergée par Stripe
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  // plusieurs moyens proposés : choisir « Card » pour faire apparaître les champs
  await page.getByTestId("card-accordion-item-button").dispatchEvent("click", undefined, { timeout: 30_000 });
  await page.locator("#cardNumber").fill("4242 4242 4242 4242");
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("Youssef Trabelsi");
  const pays = page.locator("#billingCountry");
  if (await pays.count()) await pays.selectOption("FR").catch(() => undefined);
  const cp = page.locator("#billingPostalCode");
  if (await cp.isVisible().catch(() => false)) await cp.fill("75001");
  await page.locator('button[type="submit"]').click();

  // retour sur DEGLA : la session est vérifiée auprès de Stripe, la commande passe à PAYEE
  await page.waitForURL(/\/commande\/confirmation\?numero=DGL-.*session_id=/, { timeout: 90_000 });
  const numero = new URL(page.url()).searchParams.get("numero")!;
  const c2 = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = c2.db();
  await expect.poll(async () => (await db.collection("commandes").findOne({ numero }))?.statut, { timeout: 30_000 }).toBe("PAYEE");
  const paiement = await db.collection("paiements").findOne({ "objet.reference": numero, statut: "REUSSI" });
  await c2.close();
  expect(paiement?.referenceExterne).toMatch(/^cs_test_/); // vraie session Stripe, pas une simulation
  expect(paiement?.paymentIntent).toMatch(/^pi_/);
});
