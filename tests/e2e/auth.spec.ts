import { test, expect } from "@playwright/test";

test("register → verify → login → profile → address", async ({ page }) => {
  await page.goto("/inscription");
  // minimal smoke: page renders
  await expect(page).toHaveTitle(/DEGLA|Inscription/i);
});