import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * Client MongoDB partagé (un seul par processus, conservé entre les rechargements en dev).
 * MONGODB_URI par défaut : base locale `degla`.
 */
const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/degla";
const globalForMongo = globalThis as unknown as { mongo?: Promise<MongoClient> };

const client = globalForMongo.mongo ?? new MongoClient(uri).connect();
if (process.env.NODE_ENV !== "production") globalForMongo.mongo = client;

export async function getDb(): Promise<Db> {
  return (await client).db();
}
