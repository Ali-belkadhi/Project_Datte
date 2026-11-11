"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const net = require("node:net");
const { runtimePaths, serverEnvironment, isLocalNavigation, isExternalLink, availablePort, persistentServerPort, waitForHealth, initializeData } = require("../desktop/runtime.cjs");

async function temporaryDirectory(t) {
  const base = await fs.realpath(os.tmpdir());
  const dir = await fs.mkdtemp(path.join(base, "degla-desktop-test-"));
  t.after(async () => {
    assert.equal(path.dirname(dir), base);
    assert.ok(path.basename(dir).startsWith("degla-desktop-test-"));
    await fs.rm(dir, { recursive: true, force: true });
  });
  return dir;
}

test("le serveur utilise une base locale et ne reçoit aucune clé IA de la machine", () => {
  const base = { PATH: "runtime", HF_TOKEN: "secret-test", MESHY_API_KEY: "secret-test", DATABASE_URL: "remote", NODE_OPTIONS: "--inspect" };
  const env = serverEnvironment(base, { mongoPort: 12345, port: 23456, media: "local-media" });
  assert.equal(env.MONGODB_URI, "mongodb://127.0.0.1:12345/degla");
  assert.equal(env.HOSTNAME, "127.0.0.1");
  assert.equal(env.PORT, "23456");
  assert.equal(env.DEGLA_MEDIA_ROOT, "local-media");
  assert.equal(env.NEXT_TELEMETRY_DISABLED, "1");
  assert.equal(env.HF_TOKEN, undefined);
  assert.equal(env.MESHY_API_KEY, undefined);
  assert.equal(env.NODE_OPTIONS, undefined);
  assert.equal(base.HF_TOKEN, "secret-test");
});

test("la navigation reste sur l'origine locale ; les liens externes sûrs sont HTTPS", () => {
  const origin = "http://127.0.0.1:12345";
  assert.equal(isLocalNavigation(`${origin}/catalogue`, origin), true);
  assert.equal(isLocalNavigation("http://127.0.0.1:12346/catalogue", origin), false);
  assert.equal(isLocalNavigation("http://127.0.0.1:12345.evil.test/", origin), false);
  assert.equal(isLocalNavigation("file:///C:/test", origin), false);
  assert.equal(isExternalLink("https://example.com/product"), true);
  assert.equal(isExternalLink("https://user:password@example.com"), false);
  assert.equal(isExternalLink("javascript:alert(1)"), false);
  assert.equal(isExternalLink("file:///C:/test"), false);
});

test("l'initialisation conserve les médias existants et ne se répète pas", async (t) => {
  const dir = await temporaryDirectory(t);
  const paths = runtimePaths(path.join(dir, "resources"), path.join(dir, "user"));
  await fs.mkdir(path.join(paths.seedMedia, "images"), { recursive: true });
  await fs.mkdir(path.join(paths.media, "images"), { recursive: true });
  await fs.writeFile(path.join(paths.seedMedia, "images", "existing.jpg"), "seed");
  await fs.writeFile(path.join(paths.seedMedia, "images", "new.jpg"), "new seed");
  await fs.writeFile(path.join(paths.media, "images", "existing.jpg"), "user content");
  let calls = 0;
  assert.equal(await initializeData(paths, async () => { calls++; }), true);
  assert.equal(await fs.readFile(path.join(paths.media, "images", "existing.jpg"), "utf8"), "user content");
  assert.equal(await fs.readFile(path.join(paths.media, "images", "new.jpg"), "utf8"), "new seed");
  assert.equal(await initializeData(paths, async () => { calls++; }), false);
  assert.equal(calls, 1);
});

test("une initialisation échouée laisse la possibilité de réessayer", async (t) => {
  const dir = await temporaryDirectory(t);
  const paths = runtimePaths(path.join(dir, "resources"), path.join(dir, "user"));
  await assert.rejects(initializeData(paths, async () => { throw new Error("database unavailable"); }), /database unavailable/);
  await assert.rejects(fs.access(paths.marker));
  assert.equal(await initializeData(paths, async () => {}), true);
});

test("le démarrage attend une vraie réponse de santé du serveur", async (t) => {
  const port = await availablePort();
  let calls = 0;
  const server = http.createServer((req, res) => {
    calls++;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: calls > 1 }));
  });
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await waitForHealth(`http://127.0.0.1:${port}`, { timeout: 2000 });
  assert.equal(calls, 2);
});

test("une annulation interrompt l'attente du démarrage", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(waitForHealth("http://127.0.0.1:1", { signal: controller.signal }), /annulé/);
});

test("le port HTTP est conservé entre les démarrages pour garder la même origine", async (t) => {
  const dir = await temporaryDirectory(t);
  const first = await persistentServerPort(dir);
  assert.equal(await persistentServerPort(dir), first);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(dir, "http-port.json"), "utf8")), { port: first });
});

test("un port HTTP occupé est remplacé et le nouveau choix est conservé", async (t) => {
  const dir = await temporaryDirectory(t);
  const preferred = await persistentServerPort(dir);
  const server = net.createServer();
  await new Promise((resolve) => server.listen({ port: preferred, host: "127.0.0.1", exclusive: true }, resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const replacement = await persistentServerPort(dir);
  assert.notEqual(replacement, preferred);
  assert.equal(await persistentServerPort(dir), replacement);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(dir, "http-port.json"), "utf8")), { port: replacement });
});

test("une configuration de port invalide est réparée et le port MongoDB est exclu", async (t) => {
  const dir = await temporaryDirectory(t);
  const config = path.join(dir, "http-port.json");
  await fs.writeFile(config, JSON.stringify({ port: "12345" }), "utf8");
  const first = await persistentServerPort(dir);
  assert.ok(Number.isInteger(first) && first >= 1024 && first <= 65535);
  const different = await persistentServerPort(dir, first);
  assert.notEqual(different, first);
  assert.equal(await persistentServerPort(dir), different);
});
