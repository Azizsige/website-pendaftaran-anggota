import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getRejectionHistoryMap } from "@/lib/rejection-history";
import {
  expireElapsedSuspensions,
  getStatusHistoryMap,
  getSuspendedUntilMap,
} from "@/lib/status-history";
import type { Applicant } from "./types";

export interface GetApplicantsResult {
  data: Applicant[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getApplicants(
  search: string = "",
  status: string = "all",
  page: number = 1,
  limit: number = 10
): Promise<GetApplicantsResult> {
  await requireAdmin();
  try {
    await expireElapsedSuspensions();

    const whereClause: Prisma.MemberProfileWhereInput = {};

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    } else {
      whereClause.status = { not: "ACTIVE" };
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalCount, applicants] = await Promise.all([
      prisma.memberProfile.count({
        where: whereClause,
      }),
      prisma.memberProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const applicantIds = applicants.map((applicant) => applicant.id);
    const [historyMap, statusHistoryMap, suspendedUntilMap] = await Promise.all([
      getRejectionHistoryMap(applicantIds),
      getStatusHistoryMap(applicantIds),
      getSuspendedUntilMap(applicantIds),
    ]);

    return {
      data: applicants.map((applicant) => ({
        ...applicant,
        suspendedUntil: suspendedUntilMap.get(applicant.id) ?? null,
        rejectionHistories: historyMap.get(applicant.id) ?? [],
        statusChangeHistories: statusHistoryMap.get(applicant.id) ?? [],
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    logger.error("Error fetching applicants query:", error);
    return { data: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}
