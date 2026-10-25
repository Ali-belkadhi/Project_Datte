import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * Client MongoDB partagé (un seul par processus, conservé entre les rechargements en dev).
 * Connexion paresseuse : ouverte au premier appel, retentée si MongoDB n'était pas encore démarré.
 * MONGODB_URI par défaut : base locale `degla`.
 */
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla";
const globalForMongo = globalThis as unknown as { mongo?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  globalForMongo.mongo ??= new MongoClient(uri, { ignoreUndefined: true, serverSelectionTimeoutMS: 4000 })
    .connect()
    .catch((e) => {
      globalForMongo.mongo = undefined;
      throw e;
    });
  return (await globalForMongo.mongo).db();
}
