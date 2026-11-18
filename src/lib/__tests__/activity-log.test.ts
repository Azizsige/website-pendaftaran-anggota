import { describe, it, expect, vi, beforeEach } from "vitest";
import { ACTIVITY_ACTIONS, recordActivityLog } from "../activity-log";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Helper: recordActivityLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tidak mencatat log jika pelaku adalah OWNER", async () => {
    await recordActivityLog({
      actor: { id: "owner-1", role: "OWNER" },
      action: ACTIVITY_ACTIONS.UPDATE_SETTING,
      entityType: "SystemSetting",
      entityId: "setting-1",
      details: "Uji coba oleh owner",
    });

    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });

  it("mencatat log jika pelaku bukan OWNER (SUPER_ADMIN / COORDINATOR / STAFF)", async () => {
    await recordActivityLog({
      actor: { id: "admin-1", role: "SUPER_ADMIN" },
      action: ACTIVITY_ACTIONS.APPROVE_APPLICANT,
      entityType: "MemberProfile",
      entityId: "profile-1",
      details: "Menyetujui calon anggota Budi",
    });

    expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        action: "APPROVE_APPLICANT",
        entityType: "MemberProfile",
        entityId: "profile-1",
        details: "Menyetujui calon anggota Budi",
      },
    });
  });

  it("menggunakan transaction client ketika disediakan", async () => {
    const txMock = {
      activityLog: {
        create: vi.fn().mockResolvedValueOnce({ id: "log-1" }),
      },
    };

    await recordActivityLog(
      {
        actor: { id: "coord-1", role: "COORDINATOR" },
        action: ACTIVITY_ACTIONS.REJECT_APPLICANT,
      },
      txMock as never
    );

    expect(txMock.activityLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });

  it("tidak melempar error ketika penyimpanan log gagal", async () => {
    vi.mocked(prisma.activityLog.create).mockRejectedValueOnce(new Error("DB error"));

    await expect(
      recordActivityLog({
        actor: { id: "staff-1", role: "STAFF" },
        action: ACTIVITY_ACTIONS.UPDATE_SETTING,
      })
    ).resolves.toBeUndefined();
  });
});
