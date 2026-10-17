import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { MEMBER_LIST_STATUSES } from "@/lib/constants/status";

export async function getMembers(
  search: string = "",
  status: string = "all",
  page: number = 1,
  limit: number = 10
) {
  await requireAdmin();

  try {
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

    const totalCount = await prisma.memberProfile.count({
      where: whereClause,
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
    };
  } catch (error) {
    logger.error("getMembers gagal", error);
    return { data: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}
