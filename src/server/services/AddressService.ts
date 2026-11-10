import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Adresse } from "@/server/models";
import { requireRole } from "@/lib/auth/rbac";
import { toAdresse } from "@/server/modules/comptes/mappers";

export async function listAddresses(userId: string) {
  await connectMongoose();
  const docs = await Adresse.find({ userId }).sort({ parDefaut: -1, createdAt: -1 });
  return docs.map((d) => toAdresse(d));
}

export async function createAddress(userId: string, input: Record<string, unknown>) {
  await connectMongoose();
  const count = await Adresse.countDocuments({ userId });
  const parDefaut = count === 0 ? true : Boolean(input.parDefaut);
  if (parDefaut) await Adresse.updateMany({ userId }, { $set: { parDefaut: false } });
  const doc = await Adresse.create({ userId, ...input, parDefaut });
  return String(doc._id);
}

export async function updateAddress(userId: string, id: string, input: Record<string, unknown>) {
  await connectMongoose();
  const doc = await Adresse.findOne({ _id: id, userId });
  if (!doc) throw new Error("NOT_FOUND");
  Object.assign(doc, input);
  await doc.save();
  return true;
}

export async function deleteAddress(userId: string, id: string) {
  await connectMongoose();
  await Adresse.deleteOne({ _id: id, userId });
  return true;
}

export async function setDefaultAddress(userId: string, id: string) {
  await connectMongoose();
  await Adresse.updateMany({ userId }, { $set: { parDefaut: false } });
  await Adresse.updateOne({ _id: id, userId }, { $set: { parDefaut: true } });
  return true;
}

// ensure only client role touches addresses
export async function requireClient() {
  return requireRole("CLIENT");
}