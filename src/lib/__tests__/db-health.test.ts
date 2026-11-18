import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  checkDatabaseAvailable,
  isDatabaseUnavailableError,
} from "../db-health";

describe("db-health: deteksi basis data terjeda (Supabase Paused)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengenali kode error konektivitas Prisma dan pesan Supabase paused", () => {
    expect(isDatabaseUnavailableError({ code: "P1001" })).toBe(true);
    expect(isDatabaseUnavailableError({ code: "P1002" })).toBe(true);
    expect(isDatabaseUnavailableError({ code: "P2021" })).toBe(true);
    expect(isDatabaseUnavailableError({ code: "P2024" })).toBe(true);
    expect(
      isDatabaseUnavailableError({ name: "PrismaClientInitializationError" })
    ).toBe(true);
    expect(
      isDatabaseUnavailableError(
        new Error("FATAL: Tenant or user not found (project is paused)")
      )
    ).toBe(true);
    expect(
      isDatabaseUnavailableError(
        new Error("The table `public.SystemSetting` does not exist in the current database.")
      )
    ).toBe(true);
  });

  it("tidak salah menandai error bisnis atau constraint sebagai database paused", () => {
    expect(isDatabaseUnavailableError({ code: "P2002" })).toBe(false);
    expect(isDatabaseUnavailableError(new Error("QUOTA_FULL"))).toBe(false);
    expect(isDatabaseUnavailableError(null)).toBe(false);
  });

  it("mengembalikan true saat database aktif dan false ketika query gagal lalu bisa pulih saat bypassCache", async () => {
    const queryMock = vi.mocked(prisma.$queryRaw);

    queryMock.mockRejectedValueOnce(new Error("Can't reach database server"));
    const firstCheck = await checkDatabaseAvailable({ bypassCache: true });
    expect(firstCheck).toBe(false);

    // Dalam jendela cache, tidak memanggil $queryRaw berulang kali
    const cachedCheck = await checkDatabaseAvailable();
    expect(cachedCheck).toBe(false);
    expect(queryMock).toHaveBeenCalledTimes(1);

    // Saat project di-restore dan cek ulang dipicu, kembali true
    queryMock.mockResolvedValueOnce([{ "?column?": 1 }]);
    const recoveredCheck = await checkDatabaseAvailable({ bypassCache: true });
    expect(recoveredCheck).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(2);
  });
});
