import mongoose from "mongoose";

// resolved at call time so tests can set process.env.MONGODB_URI in setup

mongoose.set("bufferCommands", false);

const CONNECTION_TIMEOUT_MS = 4_000;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectMongoose(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
      })
      .then((connection) => {
        cached.conn = connection;
        return connection;
      })
      .catch((error: unknown) => {
        // Une panne temporaire (Atlas, DNS, réseau) doit pouvoir être retentée
        // au prochain appel, notamment après un rechargement à chaud en dev.
        cached.conn = null;
        cached.promise = null;
        throw error;
      });
  }
  return cached.promise;
}

export { mongoose };
