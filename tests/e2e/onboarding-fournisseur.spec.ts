import { test, expect } from '@playwright/test';
import {
  IDENTIFIANTS,
  identifiantsDisponibles,
  seConnecter,
} from './helpers';

/**
 * Onboarding fournisseur (EF-10) — parcours en 3 étapes + contrôle du RIB.
 * Nécessite un compte FOURNISSEUR sans profil déjà créé (E2E_FOURNISSEUR_*).
 */

test.describe('Onboarding fournisseur', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !identifiantsDisponibles(IDENTIFIANTS.fournisseur),
      'E2E_FOURNISSEUR_* non défini'
    );
    await seConnecter(page, IDENTIFIANTS.fournisseur);
    await page.goto('/fournisseur/onboarding');
    // Si un profil existe déjà, la page redirige vers le tableau de bord
    test.skip(
      page.url().includes('/tableau-de-bord'),
      'Profil fournisseur déjà créé pour ce compte'
    );
  });

  test('refuse un RIB invalide', async ({ page }) => {
    await page.getByLabel('Nom de la boutique').fill('Test Onboarding');
    await page.getByLabel("Adresse d'exploitation").fill('Route de Tozeur, Kébili');
    await page.getByRole('button', { name: /Suivant/ }).click();

    await page.getByLabel(/RIB bancaire/).fill('123');
    await page.getByRole('button', { name: /Suivant/ }).click();

    await page.getByRole('button', { name: /Envoyer ma demande/ }).click();
    await expect(page.getByText(/RIB = 20 chiffres/)).toBeVisible();
  });

  test('crée le profil fournisseur (statut EN_ATTENTE)', async ({ page }) => {
    await page.getByLabel('Nom de la boutique').fill('Dattes du Sud');
    await page.getByLabel("Adresse d'exploitation").fill('Route de Tozeur, Kébili');
    await page.getByRole('button', { name: /Suivant/ }).click();

    await page.getByLabel(/RIB bancaire/).fill('12345678901234567890');
    await page.getByRole('button', { name: /Suivant/ }).click();

    await page.getByRole('button', { name: /Envoyer ma demande/ }).click();

    await expect(page).toHaveURL(/\/fournisseur\/tableau-de-bord/, { timeout: 30_000 });
    await expect(page.getByText(/EN ATTENTE/i)).toBeVisible();
  });
});
