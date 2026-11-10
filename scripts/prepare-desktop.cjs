"use strict";

/** Prépare les ressources d'une installation Windows sans téléchargement au lancement. */
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { COLLECTIONS } = require("./seed-desktop.cjs");

const root = path.resolve(__dirname, "..");
const resources = path.join(root, "desktop-resources");

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root, env: { ...process.env, ...env }, stdio: "inherit", windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Commande interrompue (${signal || code}).`)));
  });
}

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

/** Les dépendances tracées sont conservées ; les secrets sont systématiquement exclus. */
function copyFilter(source) {
  const name = path.basename(source);
  return !name.startsWith(".env") && name !== ".git" && !name.endsWith(".pdb");
}

async function findMongod() {
  if (process.env.DEGLA_MONGOD_PATH) {
    const file = path.resolve(process.env.DEGLA_MONGOD_PATH);
    if (!await exists(file)) throw new Error("DEGLA_MONGOD_PATH ne désigne pas un fichier accessible.");
    return file;
  }
  const base = path.join(process.env.ProgramFiles || "C:\\Program Files", "MongoDB", "Server");
  const versions = (await fs.readdir(base, { withFileTypes: true }).catch(() => []))
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  for (const version of versions) {
    const file = path.join(base, version, "bin", "mongod.exe");
    if (await exists(file)) return file;
  }
  throw new Error("MongoDB introuvable : installez MongoDB Community ou définissez DEGLA_MONGOD_PATH.");
}

async function exportSeed(file) {
  require("@next/env").loadEnvConfig(root, false);
  const mongoose = require("mongoose");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI est requis pour préparer le catalogue initial.");
  const client = new mongoose.mongo.MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  try {
    await client.connect();
    const collections = {};
    for (const name of COLLECTIONS) collections[name] = await client.db().collection(name).find({}).toArray();
    const snapshot = { formatVersion: 1, createdAt: new Date().toISOString(), collections };
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, mongoose.mongo.BSON.EJSON.stringify(snapshot, null, 2, { relaxed: false }), "utf8");
    console.log("Catalogue initial exporté (collections du module Catalogue uniquement).");
  } finally { await client.close(); }
}

async function copyMongo(mongod, destination) {
  await fs.mkdir(destination, { recursive: true });
  await fs.copyFile(mongod, path.join(destination, "mongod.exe"));
  const bin = path.dirname(mongod);
  for (const item of await fs.readdir(bin, { withFileTypes: true })) {
    if (item.isFile() && item.name.toLowerCase().endsWith(".dll")) {
      await fs.copyFile(path.join(bin, item.name), path.join(destination, item.name));
    }
  }
  const mongoRoot = path.dirname(bin);
  for (const name of ["LICENSE-Community.txt", "THIRD-PARTY-NOTICES", "MPL-2", "README"]) {
    const file = path.join(mongoRoot, name);
    if (await exists(file)) await fs.cp(file, path.join(destination, name), { recursive: true, dereference: true });
  }
}

async function prepare() {
  if (process.platform !== "win32") throw new Error("Cette préparation utilise les exécutables Windows x64.");
  if (process.versions.electron) throw new Error("Exécutez ce script avec Node.js, pas Electron.");
  const args = new Set(process.argv.slice(2));
  const mongod = await findMongod();
  const snapshot = path.resolve(root, process.env.DEGLA_SEED_FILE || "desktop-seed/catalogue.json");
  if (!await exists(snapshot) || args.has("--refresh-seed")) await exportSeed(snapshot);
  if (!args.has("--skip-build")) {
    await run(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"], {
      DEGLA_DESKTOP_BUILD: "1", NEXT_BUILD_CPUS: process.env.NEXT_BUILD_CPUS || "1",
    });
  }
  const standalone = path.join(root, ".next-desktop", "standalone");
  if (!await exists(path.join(standalone, "server.js"))) throw new Error("Compilation autonome absente : relancez sans --skip-build.");
  // Le seul dossier supprimable est ce répertoire généré, résolu sous la racine du projet.
  if (path.dirname(resources) !== root || path.basename(resources) !== "desktop-resources") {
    throw new Error("Chemin de ressources non sûr.");
  }
  await fs.rm(resources, { recursive: true, force: true });
  const server = path.join(resources, "server");
  await fs.cp(standalone, server, { recursive: true, dereference: true, filter: copyFilter });
  await fs.cp(path.join(root, "public"), path.join(server, "public"), { recursive: true, dereference: true, filter: copyFilter });
  await fs.cp(path.join(root, ".next-desktop", "static"), path.join(server, ".next-desktop", "static"), {
    recursive: true, dereference: true, filter: copyFilter,
  });
  await fs.copyFile(path.join(__dirname, "seed-desktop.cjs"), path.join(server, "desktop-seed.cjs"));
  if (!await exists(path.join(server, "node_modules", "mongoose", "package.json"))) {
    throw new Error("Mongoose manque dans le serveur autonome : vérifiez outputFileTracingIncludes.");
  }
  await fs.mkdir(path.join(resources, "runtime"), { recursive: true });
  await fs.copyFile(process.execPath, path.join(resources, "runtime", "node.exe"));
  await fs.copyFile(path.join(root, "desktop", "licenses", "LICENSE-nodejs.txt"), path.join(resources, "runtime", "LICENSE-nodejs.txt"));
  await copyMongo(mongod, path.join(resources, "mongodb"));
  await fs.mkdir(path.join(resources, "seed"), { recursive: true });
  await fs.copyFile(snapshot, path.join(resources, "seed", "catalogue.json"));
  const media = path.join(root, "storage", "media");
  if (await exists(media)) {
    await fs.cp(media, path.join(resources, "seed", "media"), { recursive: true, dereference: true, filter: copyFilter });
  } else await fs.mkdir(path.join(resources, "seed", "media"), { recursive: true });
  console.log("Ressources Windows prêtes dans desktop-resources. Aucun fichier .env n'est embarqué.");
}

if (require.main === module) prepare().catch((error) => {
  console.error("Préparation Windows impossible :", error.message);
  process.exitCode = 1;
});

module.exports = { copyFilter, findMongod, exportSeed };
