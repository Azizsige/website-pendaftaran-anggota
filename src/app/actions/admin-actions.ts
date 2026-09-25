"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware internal untuk memastikan hanya SUPER_ADMIN yang bisa memanggil fungsi ini
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized. Only Super Admin can perform this action.");
  }
  return session.user;
}

export async function getMembersList(statusFilter?: string) {
  try {
    await requireSuperAdmin();

    const members = await prisma.memberProfile.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: members };
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return { success: false, message: error.message || "Failed to fetch members" };
  }
}

export async function updateMemberStatus(profileId: string, newStatus: string, notes?: string) {
  try {
    const adminUser = await requireSuperAdmin();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const updatedProfile = await tx.memberProfile.update({
        where: { id: profileId },
        data: {
          status: newStatus,
          adminNotes: notes || null,
        },
        include: { user: true }
      });

      // 2. Catat log
      await tx.activityLog.create({
        data: {
          userId: adminUser.id,
          action: `UPDATE_STATUS_${newStatus}`,
          entityType: "MemberProfile",
          entityId: profileId,
          details: `Admin changed status to ${newStatus}. Notes: ${notes || "-"}`,
        }
      });

      return updatedProfile;
    });

    return { success: true, message: "Status member berhasil diperbarui.", data: result };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { success: false, message: error.message || "Failed to update member status" };
  }
}
