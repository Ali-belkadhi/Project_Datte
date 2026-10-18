import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

/**
 * Tests E2E — DEGLA (Module A : RBAC + onboarding fournisseur)
 *
 * Pré-requis pour lancer la suite complète :
 *  - une base MongoDB accessible (MONGODB_URI)
 *  - un serveur Next (démarré automatiquement sauf si E2E_NO_SERVER=1)
 *  - des comptes de test fournis via variables d'environnement :
 *      E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 *      E2E_CLIENT_EMAIL / E2E_CLIENT_PASSWORD
 *      E2E_FOURNISSEUR_EMAIL / E2E_FOURNISSEUR_PASSWORD
 *
 * Les tests nécessitant des comptes sont automatiquement ignorés si les
 * variables correspondantes ne sont pas définies.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
