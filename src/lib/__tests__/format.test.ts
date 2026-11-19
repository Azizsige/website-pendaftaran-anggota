import { describe, it, expect } from "vitest";
import {
  formatIndonesianPhoneInput,
  normalizeIndonesianPhone,
} from "../format";

describe("normalizeIndonesianPhone", () => {
  it("menambahkan awalan 0 untuk nomor yang diawali 8 dengan atau tanpa strip", () => {
    expect(normalizeIndonesianPhone("813-2299-1084")).toBe("081322991084");
    expect(normalizeIndonesianPhone("82261190199")).toBe("082261190199");
  });

  it("mengonversi awalan +62 dan 62 menjadi 0 serta menormalkan 0 berulang", () => {
    expect(normalizeIndonesianPhone("+6281234567890")).toBe("081234567890");
    expect(normalizeIndonesianPhone("62812-3456-7890")).toBe("081234567890");
    expect(normalizeIndonesianPhone("+62 0812-7711-9045")).toBe("081277119045");
    expect(normalizeIndonesianPhone("081-2771-19045")).toBe("081277119045");
  });

  it("mengembalikan string kosong untuk nilai null, undefined, atau kosong", () => {
    expect(normalizeIndonesianPhone(null)).toBe("");
    expect(normalizeIndonesianPhone(undefined)).toBe("");
    expect(normalizeIndonesianPhone("   ")).toBe("");
  });
});

describe("formatIndonesianPhoneInput", () => {
  it("memformat ketikan nomor lokal menjadi blok 4-4-N dengan aman", () => {
    expect(formatIndonesianPhoneInput("081234567890")).toBe("0812-3456-7890");
    expect(formatIndonesianPhoneInput("+6281234567890")).toBe("0812-3456-7890");
  });

  it("hanya menambahkan 0 di depan saat ensureLeadingZero diaktifkan", () => {
    expect(formatIndonesianPhoneInput("81322991084")).toBe("8132-2991-084");
    expect(
      formatIndonesianPhoneInput("81322991084", { ensureLeadingZero: true })
    ).toBe("0813-2299-1084");
  });
});
