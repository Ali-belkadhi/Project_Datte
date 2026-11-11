import "server-only";
import mongoose from "mongoose";

/**
 * Connexion MongoDB du module B (catalogue) — repris de degla-module-b (shared/database/mongodb.ts).
 * La promesse est mise en cache sur `globalThis` pour survivre au rechargement à chaud de `next dev`.
 */
const globalCache = globalThis as unknown as { __deglaMongo?: Promise<typeof mongoose> };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI est absent de .env.local (voir .env.example).");
  if (mongoose.connection.readyState === 1) return;
  globalCache.__deglaMongo ??= mongoose.connect(uri).catch((e) => {
    globalCache.__deglaMongo = undefined;
    throw e;
  });
  await globalCache.__deglaMongo;
}

export const connectMongo = connectDB;
