/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db/mongoose", () => ({ connectMongoose: vi.fn().mockResolvedValue({}) }));
vi.mock("@/server/models", () => ({
  User: { findOne: vi.fn(), create: vi.fn() },
  Client: { create: vi.fn() },
  Fournisseur: { create: vi.fn() },
}));
vi.mock("@/server/services/OtpService", () => ({
  generateOtp: vi.fn().mockResolvedValue("123456"),
}));
vi.mock("@/server/services/MailService", () => ({
  MailService: { sendOtpEmail: vi.fn().mockResolvedValue(undefined) },
}));

import { User, Client } from "@/server/models";
import { registerUser } from "@/server/services/AuthService";

describe("Registration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates user and client profile", async () => {
    (User.findOne as any).mockResolvedValue(null);
    (User.create as any).mockResolvedValue({ _id: "u1", email: "a@b.com", langue: "FR" });
    (Client.create as any).mockResolvedValue({});
    const r = await registerUser({
      prenom: "John",
      nom: "Doe",
      email: "a@b.com",
      motDePasse: "password123",
      role: "CLIENT",
      langue: "FR",
    });
    expect(r.userId).toBe("u1");
    expect(Client.create).toHaveBeenCalled();
  });

  it("rejects duplicate email", async () => {
    (User.findOne as any).mockResolvedValue({ _id: "existing" });
    await expect(
      registerUser({ prenom: "John", nom: "Doe", email: "a@b.com", motDePasse: "password123", role: "CLIENT", langue: "FR" }),
    ).rejects.toThrow();
  });
});