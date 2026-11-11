import "server-only";
import { MongoClient, type Db } from "mongodb";
import { connectMongoose } from "@/server/db/mongoose";

/**
 * Connexions MongoDB (une seule base : MONGODB_URI).
 *  - `connectDB()` : mongoose (modules A et B, modèles).
 *  - `getDb()`     : driver natif (module C, collections commandes / paiements / panier…).
 * Les promesses sont mises en cache sur `globalThis` pour survivre au rechargement à chaud de `next dev`.
 */
const globalCache = globalThis as unknown as { __deglaMongoClient?: Promise<MongoClient> };

export async function connectDB() {
  await connectMongoose();
}

export const connectMongo = connectDB;

/** Base du driver natif (module C). Connexion paresseuse, retentée si MongoDB n'était pas démarré. */
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla";
  globalCache.__deglaMongoClient ??= new MongoClient(uri, { ignoreUndefined: true, serverSelectionTimeoutMS: 4000 })
    .connect()
    .catch((e) => {
      globalCache.__deglaMongoClient = undefined;
      throw e;
    });
  return (await globalCache.__deglaMongoClient).db();
}
