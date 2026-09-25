"use server";

import { prisma } from "@/lib/prisma";

export type DashboardData = {
  stats: {
    totalAnggota: number;
    pending: number;
    approvedInRange: number;
    rejected: number;
  };
  recentApplicants: any[];
  chart: {
    labels: string[];
    data: number[];
  };
};

export async function getDashboardData({
  from,
  to,
  chartRange,
}: {
  from?: string | null;
  to?: string | null;
  chartRange?: string | null;
}): Promise<DashboardData> {
  // 1. Date Range Filter for Stats and Table
  let fromDate = from ? new Date(from) : undefined;
  let toDate = to ? new Date(to) : undefined;
  const nowForFilter = new Date();

  if (!from && !to) {
    fromDate = new Date(nowForFilter.setHours(0, 0, 0, 0));
    toDate = new Date(nowForFilter.setHours(23, 59, 59, 999));
  } else {
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    } else if (fromDate) {
      toDate = new Date(fromDate);
      toDate.setHours(23, 59, 59, 999);
    }
  }

  const dateFilter = {
    createdAt: {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    },
  };

  // Fetch Stats
  const totalAnggota = await prisma.memberProfile.count({ where: { status: "ACTIVE", ...dateFilter } });
  const pending = await prisma.memberProfile.count({ where: { status: "PENDING", ...dateFilter } });
  const approvedInRange = await prisma.memberProfile.count({ where: { status: "ACTIVE", ...dateFilter } });
  const rejected = await prisma.memberProfile.count({ where: { status: "REJECTED", ...dateFilter } });

  // Fetch Recent Applicants
  const recentApplicants = await prisma.memberProfile.findMany({
    where: dateFilter,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: true },
  });

  // 2. Chart Data
  const cRange = chartRange || "6_months";
  const now = new Date();
  let startDate = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartLabels: string[] = [];
  const chartDataArray: number[] = [];

  if (cRange === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    const recentRegistrations = await prisma.memberProfile.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const currentMonth = now.getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      chartLabels.push(monthNames[i]);
      chartDataArray.push(
        recentRegistrations.filter((r) => r.createdAt.getMonth() === i).length
      );
    }
  } else {
    // Default: Last 6 Months
    startDate.setMonth(now.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const recentRegistrations = await prisma.memberProfile.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      chartLabels.push(monthNames[month]);
      chartDataArray.push(
        recentRegistrations.filter(
          (r) => r.createdAt.getMonth() === month && r.createdAt.getFullYear() === d.getFullYear()
        ).length
      );
    }
  }

  // ---- DEBUGGING CONSOLE LOG FOR CHART ----
  console.log("===============================");
  console.log("📊 DEBUG: Chart Data Generation");
  console.log("Filter Range:", cRange);
  console.log("Calculated Start Date:", startDate);
  console.log("Generated Labels:", chartLabels);
  console.log("Generated Data:", chartDataArray);
  console.log("===============================");

  return {
    stats: {
      totalAnggota,
      pending,
      approvedInRange,
      rejected,
    },
    recentApplicants,
    chart: {
      labels: chartLabels,
      data: chartDataArray,
    },
  };
}
