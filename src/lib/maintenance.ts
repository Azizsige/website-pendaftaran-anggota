import "server-only";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Sistem sedang dalam pemeliharaan terjadwal oleh pengembang. Silakan kembali beberapa saat lagi.";

export interface MaintenanceState {
  enabled: boolean;
  message: string;
}

export async function getMaintenanceState(): Promise<MaintenanceState> {
  try {
    const map = await getCachedSettingsMap();
    const enabled = map.get(SETTING_KEYS.MAINTENANCE_MODE) === "true";
    const configuredMessage = map.get(SETTING_KEYS.MAINTENANCE_MESSAGE)?.trim();

    return {
      enabled,
      message: configuredMessage || DEFAULT_MAINTENANCE_MESSAGE,
    };
  } catch (error) {
    logger.warn("Gagal memeriksa status maintenance mode", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      enabled: false,
      message: DEFAULT_MAINTENANCE_MESSAGE,
    };
  }
}
