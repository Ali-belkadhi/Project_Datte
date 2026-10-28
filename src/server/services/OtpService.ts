import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { connectMongoose } from "@/server/db/mongoose";
import { Otp } from "@/server/models";
import type { OtpPurpose } from "@/server/models/Otp";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 3;
const COOLDOWN_MS = 60 * 1000;

export class OtpError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "OtpError";
  }
}

function hashCode(code: string): string {
  return bcrypt.hashSync(code, 10);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// generate and return plaintext code (service layer only, never to client)
export async function generateOtp(email: string, purpose: OtpPurpose, userId?: string): Promise<string> {
  await connectMongoose();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const last = await Otp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (last && now.getTime() - new Date(last.createdAt ?? 0).getTime() < COOLDOWN_MS) {
    throw new OtpError("COOLDOWN");
  }
  const count = await Otp.countDocuments({ email, purpose, createdAt: { $gte: oneHourAgo } });
  if (count >= MAX_CODES_PER_HOUR) {
    throw new OtpError("RATE_LIMIT");
  }
  await Otp.updateMany({ email, purpose, consumedAt: { $exists: false } }, { $set: { consumedAt: now } });

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await Otp.create({
    email,
    userId,
    purpose,
    codeHash: hashCode(code),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS),
    attempts: 0,
  });
  return code;
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<boolean> {
  await connectMongoose();
  const otp = await Otp.findOne({ email, purpose, consumedAt: { $exists: false } }).sort({ createdAt: -1 });
  if (!otp) return false;
  if (otp.expiresAt.getTime() < Date.now()) {
    await Otp.updateOne({ _id: otp._id }, { $set: { consumedAt: new Date() } });
    return false;
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await Otp.updateOne({ _id: otp._id }, { $set: { consumedAt: new Date() } });
    return false;
  }
  const match = bcrypt.compareSync(code, otp.codeHash);
  if (!match) {
    const newAttempts = otp.attempts + 1;
    const update: Record<string, unknown> = { attempts: newAttempts };
    if (newAttempts >= MAX_ATTEMPTS) update.consumedAt = new Date();
    await Otp.updateOne({ _id: otp._id }, { $set: update });
    return false;
  }
  await Otp.updateOne({ _id: otp._id }, { $set: { consumedAt: new Date() } });
  return true;
}

// unused helper kept for potential timing-safe direct compare
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqualStr(a, b);
}