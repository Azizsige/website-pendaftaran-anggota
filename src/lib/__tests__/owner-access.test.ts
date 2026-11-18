import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bcrypt from "bcrypt";
import {
  OWNER_DEVICE_COOKIE,
  computeOwnerDeviceToken,
  ensureOwnerUserInDb,
  isIpMatch,
  normalizeIp,
  verifyOwnerEnvironmentAccess,
  verifyOwnerIpAccess,
} from "../owner-access";

const mockHeadersGet = vi.fn();
const mockCookiesGet = vi.fn();
const mockFindUnique = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: mockHeadersGet,
  })),
  cookies: vi.fn(async () => ({
    get: mockCookiesGet,
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

describe("Helper: owner-access (IP, Device Lock & Sync Owner)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OWNER_ALLOWED_IPS;
    delete process.env.OWNER_DEVICE_SECRET;
    process.env.NEXTAUTH_SECRET = "test-nextauth-secret";
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
  });

  it("menormalisasi dan mencocokkan IP persis maupun wildcard", () => {
    expect(normalizeIp("::ffff:127.0.0.1")).toBe("127.0.0.1");
    expect(isIpMatch("::ffff:127.0.0.1", "127.0.0.1")).toBe(true);
    expect(isIpMatch("114.122.10.55", "114.122.10.*")).toBe(true);
    expect(isIpMatch("103.10.20.1", "114.122.10.*")).toBe(false);
  });

  it("mengizinkan akses saat OWNER_ALLOWED_IPS dan OWNER_DEVICE_SECRET kosong", async () => {
    mockHeadersGet.mockReturnValue(null);
    mockCookiesGet.mockReturnValue(undefined);

    const res = await verifyOwnerEnvironmentAccess();
    expect(res.allowed).toBe(true);
    expect(res.ipRestrictionEnabled).toBe(false);
    expect(res.deviceLockEnabled).toBe(false);
  });

  it("menolak IP asing di production saat OWNER_ALLOWED_IPS diset", async () => {
    process.env.OWNER_ALLOWED_IPS = "114.122.10.*";
    mockHeadersGet.mockImplementation((name: string) =>
      name === "x-forwarded-for" ? "203.0.113.9, 10.0.0.1" : null
    );

    const res = await verifyOwnerEnvironmentAccess();
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("IP_NOT_ALLOWED");
    expect(res.currentIp).toBe("203.0.113.9");
  });

  it("menolak jika cookie perangkat hilang dan mengizinkan jika token cocok", async () => {
    process.env.OWNER_ALLOWED_IPS = "114.122.10.5";
    process.env.OWNER_DEVICE_SECRET = "laptop-pribadi-rahasia";
    mockHeadersGet.mockImplementation((name: string) =>
      name === "x-real-ip" ? "114.122.10.5" : null
    );

    mockCookiesGet.mockReturnValue(undefined);
    const blocked = await verifyOwnerEnvironmentAccess();
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toBe("DEVICE_NOT_AUTHORIZED");

    const validToken = computeOwnerDeviceToken("laptop-pribadi-rahasia");
    mockCookiesGet.mockImplementation((name: string) =>
      name === OWNER_DEVICE_COOKIE ? { value: validToken } : undefined
    );
    const allowed = await verifyOwnerEnvironmentAccess();
    expect(allowed.allowed).toBe(true);
  });

  it("memvalidasi IP whitelist secara terpisah lewat verifyOwnerIpAccess", async () => {
    process.env.OWNER_ALLOWED_IPS = "182.8.98.174";
    mockHeadersGet.mockImplementation((name: string) =>
      name === "cf-connecting-ip" ? "182.8.98.174" : null
    );

    const allowed = await verifyOwnerIpAccess();
    expect(allowed.allowed).toBe(true);
    expect(allowed.currentIp).toBe("182.8.98.174");
  });

  it("membuat akun OWNER baru jika belum ada saat ensureOwnerUserInDb dipanggil", async () => {
    process.env.OWNER_EMAIL = "owner.dev@example.com";
    process.env.OWNER_PASSWORD = "rahasia-owner-123";
    mockFindUnique.mockResolvedValue(null);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "owner-1",
      email: "owner.dev@example.com",
      name: "Developer / Maintainer",
    });

    const user = await ensureOwnerUserInDb();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(user).toEqual({
      id: "owner-1",
      email: "owner.dev@example.com",
      name: "Developer / Maintainer",
      role: "OWNER",
    });
  });

  it("menyinkronkan email dan kata sandi OWNER yang sudah ada jika .env berubah", async () => {
    process.env.OWNER_EMAIL = "baru@example.com";
    process.env.OWNER_PASSWORD = "password-baru";
    const oldHash = await bcrypt.hash("password-lama", 10);
    mockFindUnique.mockResolvedValue(null);
    mockFindFirst.mockResolvedValue({
      id: "owner-1",
      email: "owner@system.local",
      name: "System Owner",
      password: oldHash,
      role: "OWNER",
      status: "ACTIVE",
    });
    mockUpdate.mockResolvedValue({
      id: "owner-1",
      email: "baru@example.com",
      name: "System Owner",
    });

    const user = await ensureOwnerUserInDb();
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(user.email).toBe("baru@example.com");
    expect(user.role).toBe("OWNER");
  });
});
