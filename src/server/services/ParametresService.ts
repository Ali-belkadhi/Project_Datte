/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { ParametresPlateforme } from "@/server/models";
import { JournalAudit } from "@/server/models";

let cache: any = null;

export async function getParametres() {
  if (cache) return cache;
  await connectMongoose();
  let doc = await (ParametresPlateforme as any).findOne();
  if (!doc) doc = await (ParametresPlateforme as any).create({});
  cache = doc;
  return doc;
}

export async function updateParametres(patch: Record<string, unknown>, adminId: string) {
  await connectMongoose();
  const before = await getParametres();
  const beforeObj = before.toObject ? before.toObject() : { ...before };
  Object.assign(before, patch);
  await before.save();
  cache = before;
  await (JournalAudit as any).create({ action: "PARAMETRES_MODIFIES", entite: "ParametresPlateforme", entiteId: String(before._id), details: { before: beforeObj, after: patch }, utilisateurId: adminId });
  return before;
}

export function invalidateParametresCache() { cache = null; }