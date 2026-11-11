/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db/mongoose", () => ({ connectMongoose: vi.fn().mockResolvedValue({}) }));
vi.mock("@/server/models", () => ({
  Otp: {
    findOne: vi.fn(),
    countDocuments: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
    updateOne: vi.fn(),
  },
}));

import { Otp } from "@/server/models";
import { generateOtp, verifyOtp, OtpError } from "@/server/services/OtpService";

describe("OTP", () => {
  beforeEach(() => vi.clearAllMocks());

  it("enforces cooldown on resend", async () => {
    (Otp.findOne as any).mockReturnValue({ sort: () => Promise.resolve({ createdAt: new Date() }) });
    (Otp.countDocuments as any).mockResolvedValue(0);
    (Otp.updateMany as any).mockResolvedValue({});
    (Otp.create as any).mockResolvedValue({});
    await expect(generateOtp("a@b.com", "VERIFY_EMAIL")).rejects.toBeInstanceOf(OtpError);
  });

  it("verifyOtp returns false for missing code", async () => {
    (Otp.findOne as any).mockReturnValue({ sort: () => Promise.resolve(null) });
    const ok = await verifyOtp("a@b.com", "VERIFY_EMAIL", "123456");
    expect(ok).toBe(false);
  });
});