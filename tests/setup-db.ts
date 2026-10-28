/// <reference types="vitest/globals" />
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test-secret";
  process.env.RIB_ENCRYPTION_KEY = process.env.RIB_ENCRYPTION_KEY || "test-rib-key";
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});