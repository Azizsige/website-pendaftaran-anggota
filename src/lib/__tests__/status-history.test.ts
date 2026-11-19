import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTx = {
  memberProfile: { update: vi.fn() },
  user: { update: vi.fn() },
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
    $transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<void>) => cb(mockTx)),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  expireElapsedSuspensions,
  getStatusHistoryMap,
  recordStatusChange,
} from "../status-history";

describe("Helper: status-history (pembekuan & jejak audit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menyimpan catatan perubahan status beserta pelaku dan batas durasi", async () => {
    await recordStatusChange({
      memberProfileId: "mem_1",
      previousStatus: "ACTIVE",
      newStatus: "SUSPENDED",
      reason: "Pelanggaran tata tertib",
      suspendedUntil: new Date("2026-12-01T10:00:00.000Z"),
      changedById: "adm_1",
      changedByName: "Super Admin",
      changedByRole: "SUPER_ADMIN",
    });

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it("memulihkan akun yang masa pembekuannya sudah lewat dan mencatat riwayat sistem", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      { id: "mem_exp_1", userId: "usr_exp_1" },
    ]);

    const count = await expireElapsedSuspensions(["mem_exp_1"]);

    expect(count).toBe(1);
    expect(mockTx.memberProfile.update).toHaveBeenCalledWith({
      where: { id: "mem_exp_1" },
      data: { status: "ACTIVE" },
    });
    expect(mockTx.user.update).toHaveBeenCalledWith({
      where: { id: "usr_exp_1" },
      data: { status: "ACTIVE" },
    });
    // Memanggil update suspendedUntil = null serta insert StatusChangeHistory
    expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it("mengelompokkan riwayat status ke Map dengan tipe Date yang terkonversi", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        id: "sts_1",
        memberProfileId: "mem_1",
        previousStatus: "ACTIVE",
        newStatus: "SUSPENDED",
        reason: "Verifikasi ulang data",
        suspendedUntil: "2026-11-26T23:59:59.000Z",
        changedById: "adm_1",
        changedByName: "Koordinator",
        changedByRole: "COORDINATOR",
        changedAt: "2026-11-19T12:00:00.000Z",
      },
    ]);

    const map = await getStatusHistoryMap(["mem_1"]);
    const entries = map.get("mem_1");

    expect(entries).toHaveLength(1);
    expect(entries?.[0]?.newStatus).toBe("SUSPENDED");
    expect(entries?.[0]?.suspendedUntil).toBeInstanceOf(Date);
    expect(entries?.[0]?.changedAt).toBeInstanceOf(Date);
    expect(entries?.[0]?.changedByName).toBe("Koordinator");
  });
});
