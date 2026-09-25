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

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });
    return { success: true, data: settings };
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return { success: false, message: error.message || "Failed to fetch settings" };
  }
}

export async function updateSystemSetting(key: string, value: string) {
  try {
    const adminUser = await requireSuperAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const updatedSetting = await tx.systemSetting.update({
        where: { key },
        data: { value }
      });

      // Catat log perubahan setting
      await tx.activityLog.create({
        data: {
          userId: adminUser.id,
          action: "UPDATE_SETTING",
          entityType: "SystemSetting",
          entityId: updatedSetting.id,
          details: `Admin changed setting '${key}' to '${value}'`,
        }
      });

      return updatedSetting;
    });

    return { success: true, message: "Pengaturan berhasil disimpan.", data: result };
  } catch (error: any) {
    console.error("Error updating setting:", error);
    return { success: false, message: error.message || "Failed to update setting" };
  }
}
