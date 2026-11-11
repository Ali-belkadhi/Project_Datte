/// <reference types="vitest/globals" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
vi.mock("@/server/services/MailService", () => ({ MailService: { sendOtpEmail: vi.fn().mockResolvedValue(undefined), sendEmail: vi.fn().mockResolvedValue(undefined) } }));
import { connectMongoose } from "@/server/db/mongoose";
import { User } from "@/server/models";
import bcrypt from "bcryptjs";
import { registerUser, verifyEmail, resetPassword } from "@/server/services/AuthService";
import { generateOtp, verifyOtp } from "@/server/services/OtpService";

describe("Auth", () => {
  beforeEach(async () => {
    await connectMongoose();
    await (User as any).deleteMany({});
  });

  it("registers client and hashes password", async () => {
    const r = await registerUser({ prenom: "A", nom: "B", email: "new@test.com", motDePasse: "password123", role: "CLIENT", langue: "FR" });
    const u = await (User as any).findById(r.userId);
    expect(u.motDePasseHash).not.toBe("password123");
    expect(await bcrypt.compare("password123", u.motDePasseHash)).toBe(true);
    expect(u.emailVerifie).toBe(false);
    expect(u.role).toBe("CLIENT");
  });

  it("rejects duplicate email", async () => {
    await registerUser({ prenom: "A", nom: "B", email: "dup@test.com", motDePasse: "password123", role: "CLIENT", langue: "FR" });
    await expect(registerUser({ prenom: "A", nom: "B", email: "dup@test.com", motDePasse: "password123", role: "CLIENT", langue: "FR" })).rejects.toThrow();
  });

  it("verifies email with correct OTP", async () => {
    await (User as any).create({ email: "v@test.com", motDePasseHash: "x", prenom: "A", nom: "B", role: "CLIENT", langue: "FR", emailVerifie: false, statut: "ACTIF", tokenVersion: 0 });
    const code = await generateOtp("v@test.com", "VERIFY_EMAIL");
    const ok = await verifyEmail("v@test.com", code);
    expect(ok).toBe(true);
    const u = await (User as any).findOne({ email: "v@test.com" });
    expect(u.emailVerifie).toBe(true);
  });

  it("rejects wrong OTP 5 times then invalidates", async () => {
    const code = await generateOtp("w@test.com", "VERIFY_EMAIL");
    for (let i = 0; i < 5; i++) {
      expect(await verifyOtp("w@test.com", "VERIFY_EMAIL", "000000")).toBe(false);
    }
    expect(await verifyOtp("w@test.com", "VERIFY_EMAIL", code)).toBe(false);
  });

  it("password reset increments tokenVersion", async () => {
    const r = await registerUser({ prenom: "A", nom: "B", email: "r@test.com", motDePasse: "password123", role: "CLIENT", langue: "FR" });
    const code = await generateOtp("r@test.com", "RESET_PASSWORD");
    const u0 = await (User as any).findById(r.userId);
    const tv0 = u0.tokenVersion;
    const ok = await resetPassword("r@test.com", code, "newpassword123");
    expect(ok).toBe(true);
    const u1 = await (User as any).findById(r.userId);
    expect(u1.tokenVersion).toBe(tv0 + 1);
  });
});