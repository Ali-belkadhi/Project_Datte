/// <reference types="vitest/globals" />
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "node:path";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  process.env.MONGOMS_DOWNLOAD_DIR ??= path.join(process.cwd(), ".cache", "mongodb-binaries");
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test-secret";
  process.env.RIB_ENCRYPTION_KEY = process.env.RIB_ENCRYPTION_KEY || "test-rib-key";
}, 900000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
