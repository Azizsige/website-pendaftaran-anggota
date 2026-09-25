"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getApplicants(
  search: string = "",
  status: string = "all",
  page: number = 1,
  limit: number = 10
) {
  try {
    const whereClause: any = {};

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

    const totalCount = await prisma.memberProfile.count({
      where: whereClause,
    });

    const applicants = await prisma.memberProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: applicants,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return { data: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }
}

export async function updateApplicantStatus(
  id: string, 
  newStatus: "ACTIVE" | "REJECTED" | "PENDING" | "SUSPENDED", 
  notes?: string
) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Applicant not found");

    await prisma.$transaction(async (tx) => {
      // Update MemberProfile
      await tx.memberProfile.update({
        where: { id },
        data: {
          status: newStatus,
          ...(notes !== undefined && { adminNotes: notes }),
        },
      });

      // Update User based on status
      if (newStatus === "ACTIVE") {
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            role: "MEMBER",
            status: "ACTIVE",
          },
        });
      } else if (newStatus === "REJECTED" || newStatus === "SUSPENDED") {
         await tx.user.update({
          where: { id: profile.userId },
          data: {
            status: "INACTIVE", 
          },
        });
      }
    });

    revalidatePath("/admin/pendaftar");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAdminNotes(id: string, notes: string) {
  try {
    await prisma.memberProfile.update({
      where: { id },
      data: { adminNotes: notes },
    });
    revalidatePath("/admin/pendaftar");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating notes:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteApplicant(id: string) {
  try {
    const profile = await prisma.memberProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error("Applicant not found");

    await prisma.user.delete({
      where: { id: profile.userId },
    });

    revalidatePath("/admin/pendaftar");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting applicant:", error);
    return { success: false, error: error.message };
  }
}
