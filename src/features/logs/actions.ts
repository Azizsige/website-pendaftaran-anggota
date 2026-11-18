"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOwner } from "@/lib/auth/guards";
import { safeAction, ok, fail } from "@/lib/action-result";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import { ROLES } from "@/lib/constants/roles";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { MEMBER_STATUS, USER_STATUS } from "@/lib/constants/status";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";

export interface TrackAdminActivityInput {
  action: "VIEW_PAGE" | "VIEW_APPLICANT_DETAIL";
  entityType: string;
  entityId: string;
  details: string;
}

export async function trackAdminActivity(input: TrackAdminActivityInput) {
  return safeAction("trackAdminActivity", async () => {
    const user = await requireAdmin();
    if (user.role === ROLES.OWNER) {
      return ok();
    }

    const allowedActions = [
      ACTIVITY_ACTIONS.VIEW_PAGE,
      ACTIVITY_ACTIONS.VIEW_APPLICANT_DETAIL,
    ] as const;

    if (!allowedActions.includes(input.action)) {
      return fail("Jenis aktivitas tidak valid.");
    }

    const safeEntityId = input.entityId.trim().slice(0, 200);
    const safeEntityType = input.entityType.trim().slice(0, 60) || "Navigation";
    const safeDetails = input.details.trim().slice(0, 500);

    const recent = await prisma.activityLog.findFirst({
      where: {
        userId: user.id,
        action: input.action,
        entityId: safeEntityId,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      select: { id: true },
    });

    if (!recent) {
      await recordActivityLog({
        actor: user,
        action: input.action,
        entityType: safeEntityType,
        entityId: safeEntityId,
        details: safeDetails,
      });
    }

    return ok();
  });
}

export async function pruneActivityLogs(retentionDays: number) {
  return safeAction("pruneActivityLogs", async () => {
    await requireOwner();

    if (!Number.isInteger(retentionDays) || retentionDays < 0) {
      return fail("Rentang retensi pembersihan log tidak valid.");
    }

    const where =
      retentionDays === 0
        ? { user: { role: { not: ROLES.OWNER } } }
        : {
            user: { role: { not: ROLES.OWNER } },
            createdAt: {
              lt: new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000),
            },
          };

    const deleted = await prisma.activityLog.deleteMany({ where });

    revalidatePath("/admin/logs");
    return ok({ deletedCount: deleted.count });
  });
}

export async function toggleMaintenanceMode(
  enabled: boolean,
  customMessage?: string
) {
  return safeAction("toggleMaintenanceMode", async () => {
    await requireOwner();

    const trimmedMessage = customMessage?.trim();

    await prisma.$transaction(async (tx) => {
      await tx.systemSetting.upsert({
        where: { key: SETTING_KEYS.MAINTENANCE_MODE },
        update: { value: enabled ? "true" : "false" },
        create: {
          key: SETTING_KEYS.MAINTENANCE_MODE,
          value: enabled ? "true" : "false",
          category: "SYSTEM",
          description:
            "Menentukan apakah mode pemeliharaan darurat sistem sedang aktif.",
        },
      });

      if (customMessage !== undefined) {
        await tx.systemSetting.upsert({
          where: { key: SETTING_KEYS.MAINTENANCE_MESSAGE },
          update: { value: trimmedMessage || DEFAULT_MAINTENANCE_MESSAGE },
          create: {
            key: SETTING_KEYS.MAINTENANCE_MESSAGE,
            value: trimmedMessage || DEFAULT_MAINTENANCE_MESSAGE,
            category: "SYSTEM",
            description:
              "Pesan pemberitahuan yang ditampilkan saat mode pemeliharaan darurat aktif.",
          },
        });
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/daftar", "layout");
    revalidatePath("/admin/logs");

    return ok({
      enabled,
      message: trimmedMessage || DEFAULT_MAINTENANCE_MESSAGE,
    });
  });
}

export async function repairDataIntegrity() {
  return safeAction("repairDataIntegrity", async () => {
    await requireOwner();

    const result = await prisma.$transaction(async (tx) => {
      const activateUsers = await tx.user.updateMany({
        where: {
          memberProfile: { status: MEMBER_STATUS.ACTIVE },
          status: { not: USER_STATUS.ACTIVE },
        },
        data: { status: USER_STATUS.ACTIVE },
      });

      const deactivateUsers = await tx.user.updateMany({
        where: {
          memberProfile: {
            status: {
              in: [
                MEMBER_STATUS.REJECTED,
                MEMBER_STATUS.SUSPENDED,
                MEMBER_STATUS.INACTIVE,
              ],
            },
          },
          status: USER_STATUS.ACTIVE,
        },
        data: { status: USER_STATUS.INACTIVE },
      });

      const removedOrphans = await tx.user.deleteMany({
        where: {
          role: ROLES.MEMBER,
          memberProfile: null,
        },
      });

      return {
        fixedUsersCount: activateUsers.count + deactivateUsers.count,
        removedOrphansCount: removedOrphans.count,
      };
    });

    revalidatePath("/admin/logs");
    revalidatePath("/admin/members");
    revalidatePath("/admin/pendaftar");

    return ok(result);
  });
}
