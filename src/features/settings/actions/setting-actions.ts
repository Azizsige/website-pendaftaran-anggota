"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { toSafeMessage } from "@/lib/action-result";
import { uploadImage } from "@/lib/storage";

const GENERIC_SETTINGS_ERROR = "Terjadi kesalahan saat memproses pengaturan. Silakan coba lagi.";

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });
    return { success: true, data: settings };
  } catch (error) {
    logger.error("getSystemSettings gagal", error);
    return { success: false, message: GENERIC_SETTINGS_ERROR };
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
          details: `Admin changed setting '${key}'`,
        }
      });

      return updatedSetting;
    });

    return { success: true, message: "Pengaturan berhasil disimpan.", data: result };
  } catch (error) {
    logger.error("updateSystemSetting gagal", error, { key });
    return { success: false, message: toSafeMessage(error, GENERIC_SETTINGS_ERROR) };
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

    // Upload gambar branding (logo/favicon/signature) ke Cloudinary jika dikonfigurasi
    const processedSettings = await Promise.all(
      settings.map(async (setting) => {
        if (setting.value && setting.value.startsWith("data:image/")) {
          try {
            const uploadedUrl = await uploadImage(setting.value, "branding");
            return { ...setting, value: uploadedUrl };
          } catch (e) {
            logger.warn("Gagal upload gambar branding ke Cloudinary, fallback lokal", { error: String(e) });
            return setting;
          }
        }
        return setting;
      })
    );

    const result = await prisma.$transaction(async (tx) => {
      const upserts = processedSettings.map(setting =>
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
  } catch (error) {
    logger.error("updateMultipleSettings gagal", error, { count: settings.length });
    return { success: false, message: toSafeMessage(error, GENERIC_SETTINGS_ERROR) };
  }
}
