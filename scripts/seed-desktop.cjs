"use strict";

/** Initialise la base locale par identifiant ; une reprise ne remplace aucun document existant. */
const fs = require("node:fs/promises");
const mongoose = require("mongoose");

const COLLECTIONS = [
  "products", "varietes", "categoriederives", "packcredits",
  "creditsoldes", "creditmouvements", "modele3ds", "favoris",
];

/** Les upserts reprennent un import interrompu sans écraser les modifications déjà présentes. */
async function seedCollection(collection, documents, name) {
  if (!Array.isArray(documents)) throw new Error(`Collection initiale invalide : ${name}`);
  if (!documents.length) return 0;
  const operations = documents.map((document) => {
    if (!document || typeof document !== "object" || Array.isArray(document) || document._id === undefined) {
      throw new Error(`Document initial sans identifiant valide : ${name}`);
    }
    const { _id, ...fields } = document;
    return { updateOne: { filter: { _id }, update: { $setOnInsert: fields }, upsert: true } };
  });
  const inserted = await collection.bulkWrite(operations, { ordered: true });
  return inserted.upsertedCount;
}

async function seedDesktop({ uri = process.env.MONGODB_URI, file = process.env.DEGLA_SEED_FILE } = {}) {
  if (!uri || !file) throw new Error("La connexion MongoDB et le fichier initial sont requis.");
  const snapshot = mongoose.mongo.BSON.EJSON.parse(await fs.readFile(file, "utf8"));
  if (!snapshot || typeof snapshot.collections !== "object" || !snapshot.collections) {
    throw new Error("Le fichier initial du catalogue est invalide.");
  }
  const client = new mongoose.mongo.MongoClient(uri, { serverSelectionTimeoutMS: 15_000 });
  const result = {};
  try {
    await client.connect();
    const db = client.db();
    for (const name of COLLECTIONS) {
      const documents = snapshot.collections[name] ?? [];
      result[name] = await seedCollection(db.collection(name), documents, name);
    }
    return result;
  } finally { await client.close(); }
}

if (require.main === module) {
  seedDesktop()
    .then((result) => console.log("Catalogue local initialisé :", JSON.stringify(result)))
    .catch((error) => {
      console.error("Initialisation du catalogue impossible :", error.message);
      process.exitCode = 1;
    });
}

module.exports = { COLLECTIONS, seedCollection, seedDesktop };
