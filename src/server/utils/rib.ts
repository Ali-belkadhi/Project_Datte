import "server-only";
import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const k = process.env.RIB_ENCRYPTION_KEY;
  if (!k) throw new Error("RIB_ENCRYPTION_KEY is not defined");
  // accept hex (64 chars) or passphrase
  if (/^[0-9a-fA-F]{64}$/.test(k)) return Buffer.from(k, "hex");
  return crypto.createHash("sha256").update(k).digest();
}

export function encryptRib(rib: string): { iv: string; tag: string; data: string; last4: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(rib, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("hex"), tag: tag.toString("hex"), data: enc.toString("hex"), last4: rib.slice(-4) };
}

export function decryptRib(payload: { iv: string; tag: string; data: string }): string {
  const decipher = crypto.createDecipheriv(ALGO, key(), Buffer.from(payload.iv, "hex"));
  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
  const dec = Buffer.concat([decipher.update(Buffer.from(payload.data, "hex")), decipher.final()]);
  return dec.toString("utf8");
}

export function maskRib(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}