"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { toSafeMessage } from "@/lib/action-result";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { uploadImage } from "@/lib/storage";

const GENERIC_SETTINGS_ERROR = "Terjadi kesalahan saat memproses pengaturan. Silakan coba lagi.";

export async function getPublicRegistrationConfigData() {
  try {
    const [settings, activeCount] = await Promise.all([
      prisma.systemSetting.findMany({
        where: {
          key: {
            in: [
              SETTING_KEYS.REG_IS_ACTIVE,
              SETTING_KEYS.REG_DATE_FROM,
              SETTING_KEYS.REG_DATE_TO,
              SETTING_KEYS.REG_MAX_QUOTA,
              SETTING_KEYS.REG_REQ_KTM,
              SETTING_KEYS.REG_REQ_FOTO,
            ],
          },
        },
        select: { key: true, value: true },
      }),
      prisma.memberProfile.count({
        where: { status: { not: "REJECTED" } },
      }),
    ]);
    return { success: true as const, settings, activeCount };
  } catch (error) {
    logger.error("getPublicRegistrationConfigData gagal", error);
    return { success: false as const, settings: [], activeCount: 0 };
  }
}

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

      // Catat log perubahan setting untuk akun non-OWNER
      await recordActivityLog(
        {
          actor: adminUser,
          action: ACTIVITY_ACTIONS.UPDATE_SETTING,
          entityType: "SystemSetting",
          entityId: updatedSetting.id,
          details: `Mengubah pengaturan '${key}'`,
        },
        tx
      );

      return updatedSetting;
    });

    revalidatePath("/admin/logs");
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

      const changedKeys = settings.map((s) => s.key).slice(0, 5).join(", ");
      const extraCount = settings.length > 5 ? ` (+${settings.length - 5} lainnya)` : "";

      await recordActivityLog(
        {
          actor: adminUser,
          action: ACTIVITY_ACTIONS.UPDATE_MULTIPLE_SETTINGS,
          entityType: "SystemSetting",
          details: `Memperbarui ${settings.length} pengaturan sistem (${changedKeys}${extraCount})`,
        },
        tx
      );

      return updatedSettings;
    }, {
      maxWait: 10000, // default is 2000
      timeout: 30000, // default is 5000, increased for base64 images
    });

    revalidatePath('/'); // Revalidate public landing page
    revalidatePath('/cek-status');
    revalidatePath('/verifikasi');
    revalidatePath('/admin/logs');
    return { success: true, message: "Semua pengaturan berhasil disimpan.", data: result };
  } catch (error) {
    logger.error("updateMultipleSettings gagal", error, { count: settings.length });
    return { success: false, message: toSafeMessage(error, GENERIC_SETTINGS_ERROR) };
  }
}
