import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth/guards";
import { ROLES } from "@/lib/constants/roles";
import { SETTING_KEYS, settingsToMap } from "@/lib/constants/settings";
import { MEMBER_STATUS, USER_STATUS } from "@/lib/constants/status";
import { DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";
import { verifyOwnerEnvironmentAccess } from "@/lib/owner-access";
import { getCachedAllSettings } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CATEGORY_ACTIONS,
  ACTIVITY_LOGS_PAGE_SIZE,
  type ActivityCategory,
  type ActivityLogsResponse,
  type SystemDiagnostics,
} from "./types";

export interface GetActivityLogsParams {
  search?: string;
  role?: string;
  category?: string;
  page?: number;
  limit?: number;
}

function buildRoleFilter(role?: string): Prisma.UserWhereInput {
  const normalized = role?.trim().toUpperCase();
  if (!normalized || normalized === "ALL") {
    return { role: { not: ROLES.OWNER } };
  }
  if (normalized === ROLES.OWNER) {
    // Aktivitas OWNER tidak pernah ditampilkan di log audit.
    return { AND: [{ role: ROLES.OWNER }, { role: { not: ROLES.OWNER } }] };
  }
  return { role: normalized };
}

function createEmptyDiagnostics(
  dbConnected: boolean,
  dbLatencyMs: number,
  ownerSecurity: SystemDiagnostics["ownerSecurity"]
): SystemDiagnostics {
  return {
    dbConnected,
    dbLatencyMs,
    checkedAt: new Date().toISOString(),
    registrationActive: false,
    maintenanceMode: false,
    maintenanceMessage: DEFAULT_MAINTENANCE_MESSAGE,
    counts: {
      totalLogsNonOwner: 0,
      logsLast24h: 0,
      activeAdminsNonOwner: 0,
      totalMembers: 0,
      pendingApplicants: 0,
      securityAlertsCount: 0,
    },
    tableCounts: {
      users: 0,
      memberProfiles: 0,
      activityLogs: 0,
      systemSettings: 0,
    },
    storage: {
      photosStored: 0,
      ktmStored: 0,
      documentsStored: 0,
      cloudFilesCount: 0,
      base64FilesCount: 0,
    },
    integrity: {
      orphanMemberUsers: 0,
      statusMismatches: 0,
      incompleteDocuments: 0,
    },
    ownerSecurity,
  };
}

export async function getActivityLogsData({
  search = "",
  role = "all",
  category = "all",
  page = 1,
  limit = ACTIVITY_LOGS_PAGE_SIZE,
}: GetActivityLogsParams = {}): Promise<ActivityLogsResponse> {
  await requireOwner();
  const ownerAccess = await verifyOwnerEnvironmentAccess();
  const ownerSecurity: SystemDiagnostics["ownerSecurity"] = {
    currentIp: ownerAccess.currentIp,
    ipRestrictionEnabled: ownerAccess.ipRestrictionEnabled,
    deviceLockEnabled: ownerAccess.deviceLockEnabled,
  };

  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.min(limit, 50)
      : ACTIVITY_LOGS_PAGE_SIZE;
  const requestedPage = Number.isFinite(page) && page > 0 ? page : 1;

  let dbConnected = false;
  let dbLatencyMs = 0;
  const probeStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.max(1, Math.round(performance.now() - probeStart));
    dbConnected = true;
  } catch (err) {
    dbLatencyMs = Math.round(performance.now() - probeStart);
    logger.warn("Probe konektivitas basis data pada Log Aktivitas gagal", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const whereClause: Prisma.ActivityLogWhereInput = {
    user: buildRoleFilter(role),
  };

  const normalizedCategory = category?.trim().toUpperCase();
  if (
    normalizedCategory &&
    normalizedCategory !== "ALL" &&
    normalizedCategory in ACTIVITY_CATEGORY_ACTIONS
  ) {
    const allowedActions =
      ACTIVITY_CATEGORY_ACTIONS[normalizedCategory as Exclude<ActivityCategory, "all">];
    whereClause.action = { in: [...allowedActions] };
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    whereClause.OR = [
      { details: { contains: trimmedSearch, mode: "insensitive" } },
      { action: { contains: trimmedSearch, mode: "insensitive" } },
      { entityType: { contains: trimmedSearch, mode: "insensitive" } },
      { entityId: { contains: trimmedSearch, mode: "insensitive" } },
      { user: { name: { contains: trimmedSearch, mode: "insensitive" } } },
      { user: { email: { contains: trimmedSearch, mode: "insensitive" } } },
    ];
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [
      totalCount,
      nonOwnerLogsByAction,
      logsLast24h,
      activityLogsCount,
      usersCount,
      activeAdminsNonOwner,
      orphanMemberUsers,
      memberStatusGroup,
      statusMismatches,
      storageAndIncompleteRows,
      systemSettingsRows,
    ] = await Promise.all([
      prisma.activityLog.count({ where: whereClause }),
      prisma.activityLog.groupBy({
        by: ["action"],
        where: { user: { role: { not: ROLES.OWNER } } },
        _count: { _all: true },
      }),
      prisma.activityLog.count({
        where: {
          user: { role: { not: ROLES.OWNER } },
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.activityLog.count(),
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: { in: [ROLES.SUPER_ADMIN, ROLES.COORDINATOR, ROLES.STAFF] },
          status: USER_STATUS.ACTIVE,
        },
      }),
      prisma.user.count({
        where: {
          role: ROLES.MEMBER,
          memberProfile: null,
        },
      }),
      prisma.memberProfile.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.memberProfile.count({
        where: {
          OR: [
            {
              status: MEMBER_STATUS.ACTIVE,
              user: { status: { not: USER_STATUS.ACTIVE } },
            },
            {
              status: {
                in: [
                  MEMBER_STATUS.REJECTED,
                  MEMBER_STATUS.SUSPENDED,
                  MEMBER_STATUS.INACTIVE,
                ],
              },
              user: { status: USER_STATUS.ACTIVE },
            },
          ],
        },
      }),
      prisma.$queryRaw<
        Array<{
          photos_stored: number;
          ktm_stored: number;
          documents_stored: number;
          cloud_files_count: number;
          base64_files_count: number;
          incomplete_documents: number;
        }>
      >`
        SELECT
          COUNT(*) FILTER (WHERE "photoUrl" IS NOT NULL AND "photoUrl" <> '')::int AS photos_stored,
          COUNT(*) FILTER (WHERE "ktmImageUrl" IS NOT NULL AND "ktmImageUrl" <> '')::int AS ktm_stored,
          COUNT(*) FILTER (WHERE "documentUrl" IS NOT NULL AND "documentUrl" <> '')::int AS documents_stored,
          (
            COUNT(*) FILTER (WHERE "photoUrl" LIKE 'http%') +
            COUNT(*) FILTER (WHERE "ktmImageUrl" LIKE 'http%') +
            COUNT(*) FILTER (WHERE "documentUrl" LIKE 'http%')
          )::int AS cloud_files_count,
          (
            COUNT(*) FILTER (WHERE "photoUrl" LIKE 'data:%') +
            COUNT(*) FILTER (WHERE "ktmImageUrl" LIKE 'data:%') +
            COUNT(*) FILTER (WHERE "documentUrl" LIKE 'data:%')
          )::int AS base64_files_count,
          COUNT(*) FILTER (
            WHERE "photoUrl" IS NULL OR "photoUrl" = ''
               OR "ktmImageUrl" IS NULL OR "ktmImageUrl" = ''
          )::int AS incomplete_documents
        FROM "MemberProfile"
      `,
      getCachedAllSettings(),
    ]);

    let totalLogsNonOwner = 0;
    let securityAlertsCount = 0;
    for (const item of nonOwnerLogsByAction) {
      totalLogsNonOwner += item._count._all;
      if (
        item.action === ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS ||
        item.action === ACTIVITY_ACTIONS.LOGIN_FAILED
      ) {
        securityAlertsCount += item._count._all;
      }
    }

    let totalMembers = 0;
    let pendingApplicants = 0;
    let memberProfilesCount = 0;
    for (const item of memberStatusGroup) {
      memberProfilesCount += item._count._all;
      if (item.status === MEMBER_STATUS.ACTIVE) totalMembers += item._count._all;
      if (item.status === MEMBER_STATUS.PENDING) pendingApplicants += item._count._all;
    }

    const storageRow = storageAndIncompleteRows[0] ?? {
      photos_stored: 0,
      ktm_stored: 0,
      documents_stored: 0,
      cloud_files_count: 0,
      base64_files_count: 0,
      incomplete_documents: 0,
    };

    const photosStored = Number(storageRow.photos_stored ?? 0);
    const ktmStored = Number(storageRow.ktm_stored ?? 0);
    const documentsStored = Number(storageRow.documents_stored ?? 0);
    const cloudFilesCount = Number(storageRow.cloud_files_count ?? 0);
    const base64FilesCount = Number(storageRow.base64_files_count ?? 0);
    const incompleteDocuments = Number(storageRow.incomplete_documents ?? 0);
    const systemSettingsCount = systemSettingsRows.length;

    const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
    const currentPage = Math.min(requestedPage, totalPages);

    const rows = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * safeLimit,
      take: safeLimit,
    });

    const settingsMap = settingsToMap(systemSettingsRows);
    const regRaw =
      settingsMap.get(SETTING_KEYS.REG_IS_ACTIVE) ?? settingsMap.get("REG_IS_ACTIVE");
    const registrationActive = regRaw !== undefined ? regRaw === "true" : true;
    const maintenanceMode = settingsMap.get(SETTING_KEYS.MAINTENANCE_MODE) === "true";
    const maintenanceMessage =
      settingsMap.get(SETTING_KEYS.MAINTENANCE_MESSAGE)?.trim() ||
      DEFAULT_MAINTENANCE_MESSAGE;

    return {
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        details: row.details,
        createdAt: row.createdAt.toISOString(),
        user: row.user,
      })),
      totalCount,
      totalPages,
      currentPage,
      diagnostics: {
        dbConnected,
        dbLatencyMs,
        checkedAt: new Date().toISOString(),
        registrationActive,
        maintenanceMode,
        maintenanceMessage,
        counts: {
          totalLogsNonOwner,
          logsLast24h,
          activeAdminsNonOwner,
          totalMembers,
          pendingApplicants,
          securityAlertsCount,
        },
        tableCounts: {
          users: usersCount,
          memberProfiles: memberProfilesCount,
          activityLogs: activityLogsCount,
          systemSettings: systemSettingsCount,
        },
        storage: {
          photosStored,
          ktmStored,
          documentsStored,
          cloudFilesCount,
          base64FilesCount,
        },
        integrity: {
          orphanMemberUsers,
          statusMismatches,
          incompleteDocuments,
        },
        ownerSecurity,
      },
    };
  } catch (error) {
    logger.error("Gagal memuat data log aktivitas dan diagnostik sistem", error);
    return {
      data: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      diagnostics: createEmptyDiagnostics(dbConnected, dbLatencyMs, ownerSecurity),
    };
  }
}
