import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  computeKtaVerificationCode,
  verifyKtaVerificationCode,
} from "../kta-verification";

describe("Helper: kta-verification", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-kta-secret-key";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  it("menghasilkan kode SEC-ID format XXXX-XXXX yang konsisten untuk anggota yang sama", () => {
    const code1 = computeKtaVerificationCode("231402011", "user-123");
    const code2 = computeKtaVerificationCode("231402011", "user-123");
    expect(code1).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(code1).toBe(code2);
  });

  it("membedakan kode SEC-ID untuk NIM atau userId yang berbeda", () => {
    const codeA = computeKtaVerificationCode("231402011", "user-123");
    const codeB = computeKtaVerificationCode("231402012", "user-123");
    const codeC = computeKtaVerificationCode("231402011", "user-456");
    expect(codeA).not.toBe(codeB);
    expect(codeA).not.toBe(codeC);
  });

  it("memverifikasi kode dengan case-insensitive dan menolak kode palsu", () => {
    const code = computeKtaVerificationCode("231402011", "user-123");
    expect(verifyKtaVerificationCode("231402011", "user-123", code)).toBe(true);
    expect(
      verifyKtaVerificationCode("231402011", "user-123", code.toLowerCase())
    ).toBe(true);
    expect(verifyKtaVerificationCode("231402011", "user-123", "0000-0000")).toBe(
      false
    );
    expect(verifyKtaVerificationCode("231402011", "user-123", "")).toBe(false);
  });
});
