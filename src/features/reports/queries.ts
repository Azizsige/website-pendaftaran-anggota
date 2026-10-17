import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

export interface ReportSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export async function getReportMembers(
  status: string = "all",
  faculty: string = "all_faculty",
  dateFrom?: Date,
  dateTo?: Date,
  page: number = 1,
  limit: number = 10
) {
  await requireAdmin();
  try {
    const whereClause: Prisma.MemberProfileWhereInput = {};

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (faculty !== "all_faculty") {
      if (faculty === "teknik") whereClause.faculty = { contains: "teknik", mode: "insensitive" };
      else if (faculty === "ekonomi") whereClause.faculty = { contains: "ekonomi", mode: "insensitive" };
      else if (faculty === "hukum") whereClause.faculty = { contains: "hukum", mode: "insensitive" };
      else whereClause.faculty = faculty;
    }

    if (dateFrom && dateTo) {
      whereClause.joinDate = {
        gte: dateFrom,
        lte: dateTo,
      };
    } else if (dateFrom) {
      whereClause.joinDate = {
        gte: dateFrom,
      };
    } else if (dateTo) {
      whereClause.joinDate = {
        lte: dateTo,
      };
    }

    const totalCount = await prisma.memberProfile.count({
      where: whereClause,
    });

    const allMatching = await prisma.memberProfile.groupBy({
      by: ['status'],
      where: {
        ...(faculty !== "all_faculty" && whereClause.faculty ? { faculty: whereClause.faculty } : {}),
        ...(whereClause.joinDate ? { joinDate: whereClause.joinDate } : {})
      },
      _count: {
        _all: true
      }
    });

    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let totalAllStatus = 0;

    allMatching.forEach(item => {
      totalAllStatus += item._count._all;
      if (item.status === 'ACTIVE' || item.status === 'APPROVED') approvedCount += item._count._all;
      if (item.status === 'PENDING') pendingCount += item._count._all;
      if (item.status === 'REJECTED' || item.status === 'SUSPENDED') rejectedCount += item._count._all;
    });

    const members = await prisma.memberProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: members,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      summary: {
        total: totalAllStatus,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
      }
    };
  } catch (error) {
    logger.error("Error fetching report members:", error);
    return {
      data: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      summary: { total: 0, approved: 0, pending: 0, rejected: 0 }
    };
  }
}
