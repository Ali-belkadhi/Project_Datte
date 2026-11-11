// E2E — envoi d'un fichier (stocké dans MongoDB GridFS, compatible Vercel) puis relecture par son URL.
import { expect, test } from "@playwright/test";
import { MongoClient, GridFSBucket } from "mongodb";

// PNG 1×1 pixel
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

test("envoi d'une image puis lecture depuis GridFS", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/connexion");
  await page.locator('input[name="email"]').fill("fournisseur1@degla.test");
  await page.locator('input[name="motDePasse"]').fill("Admin123!");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/connexion"), { timeout: 60_000 });

  const r = await page.request.post("/api/uploads", {
    multipart: { purpose: "image", file: { name: "test-e2e.png", mimeType: "image/png", buffer: PNG } },
  });
  expect(r.status()).toBe(200);
  const { url } = (await r.json()) as { url: string };
  expect(url).toMatch(/^\/api\/media\/uploads\//);

  const lu = await page.request.get(url);
  expect(lu.status()).toBe(200);
  expect(lu.headers()["content-type"]).toBe("image/png");
  expect(Buffer.from(await lu.body()).equals(PNG)).toBe(true);

  // nettoyage
  const c = await MongoClient.connect(process.env.MONGODB_URI!);
  const b = new GridFSBucket(c.db(), { bucketName: "media" });
  for (const f of await b.find({ filename: url.replace("/api/media/", "") }).toArray()) await b.delete(f._id);
  await c.close();
});
