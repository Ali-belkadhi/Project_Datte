// E2E — visite de TOUTES les pages de l'application, pour chaque rôle.
// Échec si une page répond en erreur (≥ 400), affiche l'écran d'erreur, ou lève une erreur JavaScript.
// Prérequis : base amorcée (`npm run seed:reset`).
import { expect, test, type Page } from "@playwright/test";
import { MongoClient } from "mongodb";

type Ids = { produitSlug: string; produitId: string; boutique: string; variete: string; fournisseurId: string };

const PUBLIQUES = ["/", "/catalogue", "/varietes", "/recherche?q=deglet", "/assistant", "/panier", "/certifier", "/connexion", "/inscription", "/mot-de-passe", "/offline"];
const CLIENT = ["/compte", "/compte/commandes", "/compte/avis", "/compte/favoris", "/compte/adresses", "/compte/messages", "/compte/notifications", "/compte/profil", "/commande", "/commande/paiement-annule"];
const FOURNISSEUR = [
  "/vendeur", "/vendeur/commandes", "/vendeur/produits", "/vendeur/produits/nouveau", "/vendeur/avis", "/vendeur/credits",
  "/vendeur/messages", "/vendeur/boutique", "/vendeur/parametres", "/vendeur/studio-3d", "/fournisseur/produits", "/fournisseur/produits/ajouter",
  "/fournisseur/credits", "/fournisseur/studio-3d", "/fournisseur/tracabilite",
];
const ADMIN = [
  "/admin", "/admin/fournisseurs", "/admin/varietes", "/admin/categories", "/admin/packs", "/admin/moderation", "/admin/commandes", "/admin/litiges",
  "/admin/codes-promo", "/admin/avis", "/admin/certifications", "/admin/parametres",
];

let ids: Ids;

test.beforeAll(async () => {
  const c = await MongoClient.connect(process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla_integration");
  try {
    const db = c.db();
    const p = await db.collection("products").findOne({ name: "Alig Premium" });
    const f = await db.collection("fournisseurs").findOne({ nomBoutique: "Palmeraie Ben Amor" });
    ids = { produitSlug: `alig-premium-${p!._id}`, produitId: String(p!._id), boutique: f!.slug, variete: "deglet-nour", fournisseurId: String(f!._id) };
  } finally {
    await c.close();
  }
});

async function connexion(page: Page, email: string) {
  await page.goto("/connexion");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="motDePasse"]').fill("Admin123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/connexion"), { timeout: 60_000 });
}

async function visiter(page: Page, chemins: string[]) {
  const problemes: string[] = [];
  const erreursJs: string[] = [];
  page.on("pageerror", (e) => erreursJs.push(e.message.split("\n")[0]));
  for (const chemin of chemins) {
    erreursJs.length = 0;
    const r = await page.goto(chemin, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
    const statut = r?.status() ?? 0;
    const ecranErreur = await page.getByText("Une erreur inattendue est survenue").count();
    const introuvable = await page.getByRole("heading", { name: /introuvable|404/i }).count();
    if (statut >= 400 || ecranErreur || introuvable || erreursJs.length) {
      problemes.push(`${chemin} → HTTP ${statut}${ecranErreur ? " · écran d'erreur" : ""}${introuvable ? " · page introuvable" : ""}${erreursJs.length ? ` · JS: ${erreursJs.join(" | ")}` : ""} (url finale ${new URL(page.url()).pathname})`);
    }
  }
  return problemes;
}

test.describe.serial("toutes les pages", () => {
  test.setTimeout(600_000);

  test("visiteur", async ({ page }) => {
    const pages = [...PUBLIQUES, `/produit/${ids.produitSlug}`, `/boutique/${ids.boutique}`, `/variete/${ids.variete}`, `/tracabilite/${ids.produitId}`];
    expect(await visiter(page, pages)).toEqual([]);
  });

  test("client", async ({ page }) => {
    await connexion(page, "client1@degla.test");
    expect(await visiter(page, CLIENT)).toEqual([]);
  });

  test("fournisseur", async ({ page }) => {
    await connexion(page, "fournisseur1@degla.test");
    expect(await visiter(page, [...FOURNISSEUR, `/vendeur/produits/${ids.produitId}`, `/fournisseur/produits/${ids.produitId}`, `/fournisseur/produits/${ids.produitId}/modifier`])).toEqual([]);
  });

  test("admin", async ({ page }) => {
    await connexion(page, "admin@degla.tn");
    expect(await visiter(page, [...ADMIN, `/admin/fournisseurs/${ids.fournisseurId}`])).toEqual([]);
  });
});
