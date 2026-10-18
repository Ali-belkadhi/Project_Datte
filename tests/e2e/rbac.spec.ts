import { test, expect } from '@playwright/test';
import {
  IDENTIFIANTS,
  identifiantsDisponibles,
  seConnecter,
} from './helpers';

/**
 * RBAC — Middleware (pages protégées) + contrôle de rôle dans les layouts.
 */

const PAGES_PROTEGEES = ['/admin', '/fournisseur/tableau-de-bord', '/messages', '/compte'];

test.describe('RBAC — accès anonyme', () => {
  for (const chemin of PAGES_PROTEGEES) {
    test(`un visiteur anonyme sur ${chemin} est redirigé vers /connexion`, async ({ page }) => {
      await page.goto(chemin);
      await expect(page).toHaveURL(/\/connexion/);
    });
  }

  test("l'API d'administration n'est pas accessible sans session", async ({ request }) => {
    const reponse = await request.get('/admin');
    // Redirection (302/307) ou page de connexion
    expect([200, 302, 307]).toContain(reponse.status());
    if (reponse.status() === 200) {
      expect(await reponse.text()).not.toContain('Console DEGLA');
    }
  });
});

test.describe('RBAC — contrôle de rôle', () => {
  test('un ADMIN accède à la console /admin', async ({ page }) => {
    test.skip(!identifiantsDisponibles(IDENTIFIANTS.admin), 'E2E_ADMIN_* non défini');
    await seConnecter(page, IDENTIFIANTS.admin);
    await page.goto('/admin');
    await expect(page.getByText('Console DEGLA')).toBeVisible();
  });

  test('un CLIENT est redirigé hors de /admin', async ({ page }) => {
    test.skip(!identifiantsDisponibles(IDENTIFIANTS.client), 'E2E_CLIENT_* non défini');
    await seConnecter(page, IDENTIFIANTS.client);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/compte/);
    await expect(page.getByText('Console DEGLA')).toHaveCount(0);
  });

  test('un CLIENT est redirigé hors de /fournisseur', async ({ page }) => {
    test.skip(!identifiantsDisponibles(IDENTIFIANTS.client), 'E2E_CLIENT_* non défini');
    await seConnecter(page, IDENTIFIANTS.client);
    await page.goto('/fournisseur/tableau-de-bord');
    await expect(page).toHaveURL(/\/compte/);
  });

  test('un FOURNISSEUR accède à son tableau de bord', async ({ page }) => {
    test.skip(
      !identifiantsDisponibles(IDENTIFIANTS.fournisseur),
      'E2E_FOURNISSEUR_* non défini'
    );
    await seConnecter(page, IDENTIFIANTS.fournisseur);
    await page.goto('/fournisseur/tableau-de-bord');
    await expect(page).toHaveURL(/\/fournisseur/);
  });
});
