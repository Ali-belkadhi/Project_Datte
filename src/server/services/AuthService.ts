import "server-only";
import bcrypt from "bcryptjs";
import { connectMongoose } from "@/server/db/mongoose";
import { User, Client, Fournisseur } from "@/server/models";
import { generateOtp, verifyOtp } from "./OtpService";
import { MailService } from "./MailService";
import type { RegisterInput } from "@/lib/zod/auth";

export async function registerUser(input: RegisterInput): Promise<{ userId: string }> {
  await connectMongoose();
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new Error("EMAIL_EXISTS");
  const hash = await bcrypt.hash(input.motDePasse, 12);
  const user = await User.create({
    email: input.email.toLowerCase(),
    motDePasseHash: hash,
    prenom: input.prenom,
    nom: input.nom,
    role: input.role,
    langue: input.langue ?? "FR",
    emailVerifie: false,
    statut: "ACTIF",
    tokenVersion: 0,
  });
  if (input.role === "CLIENT") {
    await Client.create({ userId: user._id });
  } else {
    await Fournisseur.create({ userId: user._id });
  }
  const code = await generateOtp(user.email, "VERIFY_EMAIL", String(user._id));
  await MailService.sendOtpEmail(user.email, code, "VERIFY_EMAIL", (user.langue as "FR" | "AR" | "EN") ?? "FR");
  return { userId: String(user._id) };
}

export async function verifyEmail(email: string, code: string): Promise<boolean> {
  await connectMongoose();
  const ok = await verifyOtp(email.toLowerCase(), "VERIFY_EMAIL", code);
  if (!ok) return false;
  await User.updateOne({ email: email.toLowerCase() }, { $set: { emailVerifie: true } });
  return true;
}

export async function resendVerification(email: string, locale: "FR" | "AR" | "EN" = "FR"): Promise<void> {
  await connectMongoose();
  const user = await User.findOne({ email: email.toLowerCase() });
  // do not reveal existence
  if (!user || user.emailVerifie) return;
  const code = await generateOtp(user.email, "VERIFY_EMAIL", String(user._id));
  await MailService.sendOtpEmail(user.email, code, "VERIFY_EMAIL", locale);
}

export async function requestPasswordReset(email: string, locale: "FR" | "AR" | "EN" = "FR"): Promise<void> {
  await connectMongoose();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return; // do not reveal
  const code = await generateOtp(user.email, "RESET_PASSWORD", String(user._id));
  await MailService.sendOtpEmail(user.email, code, "RESET_PASSWORD", locale);
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<boolean> {
  await connectMongoose();
  const ok = await verifyOtp(email.toLowerCase(), "RESET_PASSWORD", code);
  if (!ok) return false;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return false;
  user.motDePasseHash = await bcrypt.hash(newPassword, 12);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();
  return true;
}

export async function logoutAllSessions(userId: string): Promise<void> {
  await connectMongoose();
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}