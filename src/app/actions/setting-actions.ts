"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

export async function updateMultipleSettings(settings: {key: string, value: string}[]) {
  try {
    const adminUser = await requireSuperAdmin();

    // Server-side validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const setting of settings) {
      if (setting.key === 'org_email' && setting.value && !emailRegex.test(setting.value)) {
        return { success: false, message: "Format email tidak valid. Ditolak oleh server." };
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const upserts = settings.map(setting => 
        tx.systemSetting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value,
            category: "GENERAL",
          }
        })
      );
      
      const updatedSettings = await Promise.all(upserts);

      await tx.activityLog.create({
        data: {
          userId: adminUser.id,
          action: "UPDATE_MULTIPLE_SETTINGS",
          entityType: "SystemSetting",
          details: `Admin updated ${settings.length} settings`,
        }
      });

      return updatedSettings;
    }, {
      maxWait: 10000, // default is 2000
      timeout: 30000, // default is 5000, increased for base64 images
    });

    revalidatePath('/'); // Revalidate public landing page
    return { success: true, message: "Semua pengaturan berhasil disimpan.", data: result };
  } catch (error: any) {
    console.error("Error updating multiple settings:", error);
    return { success: false, message: error.message || "Failed to update settings" };
  }
}
