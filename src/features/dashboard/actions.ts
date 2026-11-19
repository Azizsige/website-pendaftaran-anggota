"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { parseRegistrationSettings } from "@/lib/constants/settings";
import { getCachedAllSettings } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";
import type { MemberProfileWithUser } from "@/types/member";

const INDONESIAN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const ACTIVE_STATUSES = ["ACTIVE", "APPROVED"];

export type CategoryCountItem = {
  label: string;
  count: number;
  percentage: number;
};

export type DashboardData = {
  appliedRange: {
    fromIso: string;
    toIso: string;
  };
  stats: {
    totalActiveMembers: number;
    totalAnggota: number;
    pending: number;
    pendingQueue: number;
    pendingInRange: number;
    prevPendingInRange: number;
    approvedInRange: number;
    prevApprovedInRange: number;
    rejected: number;
    rejectedInRange: number;
    prevRejectedInRange: number;
    totalInRange: number;
    prevTotalInRange: number;
  };
  miniTrends: {
    labels: string[];
    submitted: number[];
    approved: number[];
    pending: number[];
    processed: number[];
  };
  recentApplicants: MemberProfileWithUser[];
  chart: {
    labels: string[];
    data: number[];
    totalInSeries: number;
  };
  statusBreakdown: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  facultyBreakdown: CategoryCountItem[];
  batchBreakdown: CategoryCountItem[];
  registrationMeta: {
    isActive: boolean;
    dateFromIso: string | null;
    dateToIso: string | null;
    maxQuota: number;
    usedQuota: number;
    currentMonthActiveDays: number[];
  };
};

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseValidDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function getDashboardData({
  from,
  to,
  chartRange,
}: {
  from?: string | null;
  to?: string | null;
  chartRange?: string | null;
} = {}): Promise<DashboardData> {
  await requireAdmin();

  const now = new Date();
  let fromDate = parseValidDate(from);
  let toDate = parseValidDate(to);

  if (!fromDate && !toDate) {
    toDate = new Date(now);
    toDate.setHours(23, 59, 59, 999);
    fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - 29);
    fromDate.setHours(0, 0, 0, 0);
  } else if (fromDate && !toDate) {
    fromDate.setHours(0, 0, 0, 0);
    toDate = new Date(fromDate);
    toDate.setHours(23, 59, 59, 999);
  } else if (!fromDate && toDate) {
    toDate.setHours(23, 59, 59, 999);
    fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - 29);
    fromDate.setHours(0, 0, 0, 0);
  } else if (fromDate && toDate) {
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    if (fromDate.getTime() > toDate.getTime()) {
      const swap = fromDate;
      fromDate = new Date(toDate);
      fromDate.setHours(0, 0, 0, 0);
      toDate = new Date(swap);
      toDate.setHours(23, 59, 59, 999);
    }
  }

  const resolvedFrom = fromDate as Date;
  const resolvedTo = toDate as Date;

  const dateFilter = {
    createdAt: {
      gte: resolvedFrom,
      lte: resolvedTo,
    },
  };

  const durationMs = resolvedTo.getTime() - resolvedFrom.getTime() + 1;
  const prevToDate = new Date(resolvedFrom.getTime() - 1);
  const prevFromDate = new Date(resolvedFrom.getTime() - durationMs);
  const prevDateFilter = {
    createdAt: {
      gte: prevFromDate,
      lte: prevToDate,
    },
  };

  const trendAnchor =
    resolvedTo.getTime() > now.getTime() ? new Date(now) : new Date(resolvedTo);
  trendAnchor.setHours(23, 59, 59, 999);
  const trendStart = new Date(trendAnchor);
  trendStart.setDate(trendStart.getDate() - 6);
  trendStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const cRange = chartRange || "6_months";
  const chartStartDate =
    cRange === "30_days"
      ? (() => {
          const d = new Date(now);
          d.setDate(now.getDate() - 29);
          d.setHours(0, 0, 0, 0);
          return d;
        })()
      : cRange === "this_year"
        ? new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        : new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

  const [
    allStatusGroup,
    prevStatusGroup,
    recentApplicantRows,
    rangeProfiles,
    trendProfiles,
    currentMonthProfiles,
    chartProfiles,
    settingRows,
  ] = await Promise.all([
    prisma.memberProfile.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.memberProfile.groupBy({
      by: ["status"],
      where: prevDateFilter,
      _count: { _all: true },
    }),
    prisma.memberProfile.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        userId: true,
        nim: true,
        phoneNumber: true,
        placeOfBirth: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        faculty: true,
        major: true,
        batchYear: true,
        photoUrl: true,
        joinDate: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.memberProfile.findMany({
      where: dateFilter,
      select: {
        status: true,
        faculty: true,
        batchYear: true,
      },
    }),
    prisma.memberProfile.findMany({
      where: {
        createdAt: {
          gte: trendStart,
          lte: trendAnchor,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
    }),
    prisma.memberProfile.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: { createdAt: true },
    }),
    prisma.memberProfile.findMany({
      where: { createdAt: { gte: chartStartDate } },
      select: { createdAt: true },
    }),
    getCachedAllSettings().catch((err) => {
      logger.warn("Gagal membaca pengaturan pendaftaran untuk overview", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }),
  ]);

  let totalActiveMembers = 0;
  let pendingQueue = 0;
  let usedQuota = 0;
  for (const row of allStatusGroup) {
    const count = row._count._all;
    if (ACTIVE_STATUSES.includes(row.status)) {
      totalActiveMembers += count;
      usedQuota += count;
    } else if (row.status === "PENDING") {
      pendingQueue += count;
      usedQuota += count;
    }
  }

  let prevTotalInRange = 0;
  let prevApprovedInRange = 0;
  let prevPendingInRange = 0;
  let prevRejectedInRange = 0;
  for (const row of prevStatusGroup) {
    const count = row._count._all;
    prevTotalInRange += count;
    if (ACTIVE_STATUSES.includes(row.status)) {
      prevApprovedInRange += count;
    } else if (row.status === "PENDING") {
      prevPendingInRange += count;
    } else if (row.status === "REJECTED") {
      prevRejectedInRange += count;
    }
  }

  const recentApplicants: MemberProfileWithUser[] = recentApplicantRows.map((row) => ({
    ...row,
    ktmImageUrl: null,
    documentUrl: null,
    ktmHash: null,
    photoHash: null,
    user: {
      ...row.user,
      password: null,
    },
  }));

  // 7-day mini sparklines
  const miniLabels: string[] = [];
  const miniSubmitted: number[] = [];
  const miniApproved: number[] = [];
  const miniPending: number[] = [];
  const miniProcessed: number[] = [];

  const trendMap = new Map<
    string,
    { submitted: number; approved: number; pending: number; processed: number }
  >();
  for (let i = 0; i < 7; i++) {
    const d = new Date(trendStart);
    d.setDate(trendStart.getDate() + i);
    const key = toDayKey(d);
    trendMap.set(key, {
      submitted: 0,
      approved: 0,
      pending: 0,
      processed: 0,
    });
    miniLabels.push(`${d.getDate()} ${INDONESIAN_MONTHS[d.getMonth()]}`);
  }

  for (const item of trendProfiles) {
    const key = toDayKey(item.createdAt);
    const bucket = trendMap.get(key);
    if (!bucket) continue;
    bucket.submitted += 1;
    if (ACTIVE_STATUSES.includes(item.status)) {
      bucket.approved += 1;
      bucket.processed += 1;
    } else if (item.status === "PENDING") {
      bucket.pending += 1;
    } else if (item.status === "REJECTED") {
      bucket.processed += 1;
    }
  }

  for (const [, bucket] of trendMap) {
    miniSubmitted.push(bucket.submitted);
    miniApproved.push(bucket.approved);
    miniPending.push(bucket.pending);
    miniProcessed.push(bucket.processed);
  }

  // Main Registration Chart
  const chartLabels: string[] = [];
  const chartDataArray: number[] = [];

  if (cRange === "30_days") {
    const dayCounts = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(chartStartDate);
      d.setDate(chartStartDate.getDate() + i);
      const key = toDayKey(d);
      dayCounts.set(key, 0);
      chartLabels.push(`${d.getDate()} ${INDONESIAN_MONTHS[d.getMonth()]}`);
    }

    for (const row of chartProfiles) {
      const key = toDayKey(row.createdAt);
      if (dayCounts.has(key)) {
        dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
      }
    }

    for (const [, count] of dayCounts) {
      chartDataArray.push(count);
    }
  } else if (cRange === "this_year") {
    const currentMonth = now.getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      chartLabels.push(INDONESIAN_MONTHS[i]);
      chartDataArray.push(
        chartProfiles.filter((r) => r.createdAt.getMonth() === i).length
      );
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      chartLabels.push(`${INDONESIAN_MONTHS[month]} ${String(year).slice(2)}`);
      chartDataArray.push(
        chartProfiles.filter(
          (r) =>
            r.createdAt.getMonth() === month &&
            r.createdAt.getFullYear() === year
        ).length
      );
    }
  }

  // Status counts, Faculty and Batch distributions within active date filter
  const facultyCounts = new Map<string, number>();
  const batchCounts = new Map<string, number>();
  let approvedInRange = 0;
  let pendingInRange = 0;
  let rejectedInRange = 0;

  for (const item of rangeProfiles) {
    if (ACTIVE_STATUSES.includes(item.status)) {
      approvedInRange += 1;
    } else if (item.status === "PENDING") {
      pendingInRange += 1;
    } else if (item.status === "REJECTED") {
      rejectedInRange += 1;
    }

    const facultyLabel = item.faculty?.trim() || "Belum Diisi";
    facultyCounts.set(facultyLabel, (facultyCounts.get(facultyLabel) ?? 0) + 1);

    const batchLabel = item.batchYear?.trim() || "Lainnya";
    batchCounts.set(batchLabel, (batchCounts.get(batchLabel) ?? 0) + 1);
  }

  const totalInRange = rangeProfiles.length;
  const totalRangeCount = totalInRange;
  const facultyBreakdown: CategoryCountItem[] = Array.from(
    facultyCounts.entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      percentage:
        totalRangeCount > 0 ? Math.round((count / totalRangeCount) * 100) : 0,
    }));

  const batchBreakdown: CategoryCountItem[] = Array.from(batchCounts.entries())
    .sort((a, b) => b[0].localeCompare(a[0], "id"))
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      percentage:
        totalRangeCount > 0 ? Math.round((count / totalRangeCount) * 100) : 0,
    }));

  const parsedSettings = parseRegistrationSettings(settingRows);
  const currentMonthActiveDays = Array.from(
    new Set(currentMonthProfiles.map((row) => row.createdAt.getDate()))
  ).sort((a, b) => a - b);

  const totalInSeries = chartDataArray.reduce((sum, val) => sum + val, 0);

  return {
    appliedRange: {
      fromIso: resolvedFrom.toISOString(),
      toIso: resolvedTo.toISOString(),
    },
    stats: {
      totalActiveMembers,
      totalAnggota: totalActiveMembers,
      pending: pendingQueue,
      pendingQueue,
      pendingInRange,
      prevPendingInRange,
      approvedInRange,
      prevApprovedInRange,
      rejected: rejectedInRange,
      rejectedInRange,
      prevRejectedInRange,
      totalInRange,
      prevTotalInRange,
    },
    miniTrends: {
      labels: miniLabels,
      submitted: miniSubmitted,
      approved: miniApproved,
      pending: miniPending,
      processed: miniProcessed,
    },
    recentApplicants,
    chart: {
      labels: chartLabels,
      data: chartDataArray,
      totalInSeries,
    },
    statusBreakdown: {
      approved: approvedInRange,
      pending: pendingInRange,
      rejected: rejectedInRange,
      total: approvedInRange + pendingInRange + rejectedInRange,
    },
    facultyBreakdown,
    batchBreakdown,
    registrationMeta: {
      isActive: parsedSettings.isActive,
      dateFromIso: parsedSettings.dateFrom
        ? parsedSettings.dateFrom.toISOString()
        : null,
      dateToIso: parsedSettings.dateTo
        ? parsedSettings.dateTo.toISOString()
        : null,
      maxQuota: parsedSettings.maxQuota,
      usedQuota,
      currentMonthActiveDays,
    },
  };
}
