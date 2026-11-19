import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildRegistrationNumber,
  encodeRegistrationReceipt,
  verifyRegistrationReceipt,
  type RegistrationReceipt,
} from "../registration-receipt";

describe("Helper: registration-receipt (Guard /daftar/sukses)", () => {
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-receipt-secret-key";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalSecret;
  });

  it("membentuk nomor registrasi dari tanggal dan 4 digit terakhir NIM", () => {
    const num = buildRegistrationNumber("2201011004", new Date("2026-11-19T08:00:00Z"));
    expect(num).toBe("REG-20261119-1004");
  });

  it("memverifikasi token receipt yang valid dan menolak token yang dimanipulasi", () => {
    const receipt: RegistrationReceipt = {
      registrationNumber: "REG-20261119-1004",
      submittedAt: new Date("2026-11-19T08:00:00Z").toISOString(),
      namaLengkap: "Arya Pratama",
      nim: "2201011004",
      exp: Date.now() + 60_000,
    };

    const token = encodeRegistrationReceipt(receipt);
    expect(verifyRegistrationReceipt(token)).toEqual(receipt);
    expect(verifyRegistrationReceipt(`${token}tampered`)).toBeNull();
    expect(verifyRegistrationReceipt("invalid-token")).toBeNull();
  });

  it("menolak token receipt yang sudah kedaluwarsa", () => {
    const expiredReceipt: RegistrationReceipt = {
      registrationNumber: "REG-20261119-1004",
      submittedAt: new Date("2026-11-19T08:00:00Z").toISOString(),
      namaLengkap: "Arya Pratama",
      nim: "2201011004",
      exp: Date.now() - 1000,
    };

    const token = encodeRegistrationReceipt(expiredReceipt);
    expect(verifyRegistrationReceipt(token)).toBeNull();
  });
});
