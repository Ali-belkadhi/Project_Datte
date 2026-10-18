import { Page, expect } from '@playwright/test';

export interface Identifiants {
  email: string;
  motDePasse: string;
}

export const IDENTIFIANTS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? '',
    motDePasse: process.env.E2E_ADMIN_PASSWORD ?? '',
  },
  client: {
    email: process.env.E2E_CLIENT_EMAIL ?? '',
    motDePasse: process.env.E2E_CLIENT_PASSWORD ?? '',
  },
  fournisseur: {
    email: process.env.E2E_FOURNISSEUR_EMAIL ?? '',
    motDePasse: process.env.E2E_FOURNISSEUR_PASSWORD ?? '',
  },
};

/** Vrai si le jeu d'identifiants est complet */
export function identifiantsDisponibles(id: Identifiants): boolean {
  return Boolean(id.email && id.motDePasse);
}

/** Se connecte via le formulaire /connexion */
export async function seConnecter(page: Page, id: Identifiants) {
  await page.goto('/connexion');
  await page.getByLabel('Adresse e-mail').fill(id.email);
  await page.getByLabel('Mot de passe').fill(id.motDePasse);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Attend que l'on quitte la page de connexion
  await expect(page).not.toHaveURL(/\/connexion/, { timeout: 20_000 });
}

/** Déconnecte l'utilisateur courant */
export async function seDeconnecter(page: Page) {
  const bouton = page.getByRole('button', { name: /déconnexion/i });
  if (await bouton.count()) {
    await bouton.first().click();
    await page.waitForURL(/\/$|\/connexion/);
  }
}
