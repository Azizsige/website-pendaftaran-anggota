import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import {
  backfillLegacyRejectionIfMissing,
  getRejectionHistoryMap,
  recordRejectionHistory,
} from "../rejection-history";

describe("Helper: rejection-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menyimpan entri penolakan dengan alasan default bila alasan kosong", async () => {
    await recordRejectionHistory({
      memberProfileId: "prof_1",
      reason: "   ",
      rejectedByName: "Panitia",
    });

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it("melakukan backfill penolakan lama hanya jika tabel riwayat masih kosong", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ total: 0 }]);

    await backfillLegacyRejectionIfMissing({
      memberProfileId: "prof_legacy",
      reason: "Foto KTM buram",
      rejectedAt: new Date("2026-11-10T10:00:00.000Z"),
    });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ total: 2 }]);

    await backfillLegacyRejectionIfMissing({
      memberProfileId: "prof_legacy",
      reason: "Foto KTM buram",
      rejectedAt: new Date("2026-11-10T10:00:00.000Z"),
    });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it("mengelompokkan riwayat penolakan ke dalam Map berdasarkan memberProfileId", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([
      {
        id: "rej_2",
        memberProfileId: "prof_1",
        reason: "KTM masih buram",
        rejectedByName: "Admin A",
        rejectedAt: "2026-11-19T04:00:00.000Z",
      },
      {
        id: "rej_1",
        memberProfileId: "prof_1",
        reason: "Pas foto tidak formal",
        rejectedByName: "Admin B",
        rejectedAt: "2026-11-18T04:00:00.000Z",
      },
    ]);

    const map = await getRejectionHistoryMap(["prof_1", "prof_2"]);

    expect(map.get("prof_1")).toHaveLength(2);
    expect(map.get("prof_1")?.[0]?.reason).toBe("KTM masih buram");
    expect(map.get("prof_1")?.[0]?.rejectedAt).toBeInstanceOf(Date);
    expect(map.get("prof_2")).toBeUndefined();
  });
});
