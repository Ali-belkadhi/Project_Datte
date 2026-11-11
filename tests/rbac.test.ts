/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/server/db/mongoose", () => ({
  connectMongoose: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/server/models", () => ({
  User: { findById: vi.fn() },
}));

import { auth } from "@/auth";
import { User } from "@/server/models";
import { getUtilisateurCourant, requireRole } from "@/lib/auth/rbac";
import { AuthError } from "@/lib/auth/errors";

describe("RBAC", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws UNAUTHENTICATED when no session", async () => {
    (auth as any).mockResolvedValue(null);
    await expect(getUtilisateurCourant()).rejects.toThrow(AuthError);
  });

  it("returns current user for valid session", async () => {
    (auth as any).mockResolvedValue({ user: { id: "u1", tokenVersion: 0 } });
    (User.findById as any).mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      nom: "Doe",
      prenom: "John",
      role: "CLIENT",
      langue: "FR",
      tokenVersion: 0,
      statut: "ACTIF",
      emailVerifie: true,
    });
    const u = await getUtilisateurCourant();
    expect(u.role).toBe("CLIENT");
  });

  it("rejects suspended user", async () => {
    (auth as any).mockResolvedValue({ user: { id: "u1", tokenVersion: 0 } });
    (User.findById as any).mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      nom: "Doe",
      prenom: "John",
      role: "CLIENT",
      langue: "FR",
      tokenVersion: 0,
      statut: "SUSPENDU",
      emailVerifie: true,
    });
    await expect(getUtilisateurCourant()).rejects.toThrow(AuthError);
  });

  it("rejects stale tokenVersion", async () => {
    (auth as any).mockResolvedValue({ user: { id: "u1", tokenVersion: 0 } });
    (User.findById as any).mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      nom: "Doe",
      prenom: "John",
      role: "CLIENT",
      langue: "FR",
      tokenVersion: 2,
      statut: "ACTIF",
      emailVerifie: true,
    });
    await expect(getUtilisateurCourant()).rejects.toThrow(AuthError);
  });

  it("requireRole throws FORBIDDEN for wrong role", async () => {
    (auth as any).mockResolvedValue({ user: { id: "u1", tokenVersion: 0 } });
    (User.findById as any).mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      nom: "Doe",
      prenom: "John",
      role: "CLIENT",
      langue: "FR",
      tokenVersion: 0,
      statut: "ACTIF",
      emailVerifie: true,
    });
    await expect(requireRole("ADMIN")).rejects.toThrow(AuthError);
  });
});