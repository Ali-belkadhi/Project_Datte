import { test, expect } from "@playwright/test";

test("connexion client1 → espace compte", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/connexion");
  await page.locator('input[name="email"]').fill("client1@degla.test");
  await page.locator('input[name="motDePasse"]').fill("SeedPass123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/compte/, { timeout: 60000 });
  await expect(page.getByText("Sarra", { exact: false }).first()).toBeVisible();
});

test("connexion refusée avec un mauvais mot de passe", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/connexion");
  await page.locator('input[name="email"]').fill("client1@degla.test");
  await page.locator('input[name="motDePasse"]').fill("MauvaisMotDePasse!123");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/connexion/, { timeout: 60000 });
  await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible({ timeout: 30000 });
});
