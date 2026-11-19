import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { MEMBER_LIST_STATUSES } from "@/lib/constants/status";
import { getRejectionHistoryMap } from "@/lib/rejection-history";
import {
  expireElapsedSuspensions,
  getStatusHistoryMap,
  getSuspendedUntilMap,
} from "@/lib/status-history";
import type { MemberWithUser } from "./types";

export interface GetMembersResult {
  data: MemberWithUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getMembers(
  search: string = "",
  status: string = "all",
  page: number = 1,
  limit: number = 10
): Promise<GetMembersResult> {
  await requireAdmin();

  try {
    await expireElapsedSuspensions();

    const whereClause: Prisma.MemberProfileWhereInput = {
      status: {
        in: [...MEMBER_LIST_STATUSES],
      },
    };

    if (status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { nim: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalCount, members] = await Promise.all([
      prisma.memberProfile.count({
        where: whereClause,
      }),
      prisma.memberProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: { name: true, email: true, status: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const memberIds = members.map((member) => member.id);
    const [historyMap, statusHistoryMap, suspendedUntilMap] = await Promise.all([
      getRejectionHistoryMap(memberIds),
      getStatusHistoryMap(memberIds),
      getSuspendedUntilMap(memberIds),
    ]);

    return {
      data: members.map((member) => ({
        ...member,
        suspendedUntil: suspendedUntilMap.get(member.id) ?? null,
        rejectionHistories: historyMap.get(member.id) ?? [],
        statusChangeHistories: statusHistoryMap.get(member.id) ?? [],
      })),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    logger.error("getMembers query error:", error);
    return { data: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}
