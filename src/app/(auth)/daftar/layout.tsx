import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import LandingNavbar from "@/components/layout/LandingNavbar";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { MaintenanceLockScreen } from "@/components/system/MaintenanceLockScreen";
import { authOptions } from "@/lib/auth";
import { ROLES } from "@/lib/constants/roles";
import { DEFAULT_MAINTENANCE_MESSAGE, getMaintenanceState } from "@/lib/maintenance";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota | Organisasi Mahasiswa",
  description:
    "Lengkapi formulir pendaftaran anggota baru dan unggah dokumen yang dipersyaratkan.",
};

export default async function DaftarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let orgName = "Organisasi Mahasiswa";
  let orgLogo = "";
  let maintenance = { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE };

  const [session, dbAvailable] = await Promise.all([
    getServerSession(authOptions),
    checkDatabaseAvailable(),
  ]);
  const isLoggedIn = Boolean(session?.user?.id);
  const isOwner = session?.user?.role === ROLES.OWNER;

  if (dbAvailable) {
    try {
      const [map, maintenanceState] = await Promise.all([
        getCachedSettingsMap(),
        getMaintenanceState(),
      ]);
      maintenance = maintenanceState;
      const nameSetting = map.get(SETTING_KEYS.ORG_NAME);
      const logoSetting = map.get(SETTING_KEYS.ORG_LOGO);
      if (nameSetting) orgName = nameSetting;
      if (logoSetting) orgLogo = logoSetting;
    } catch (error) {
      logger.error("Failed to load daftar layout settings:", error);
    }
  }

  return (
    <>
      <LandingNavbar
        orgName={orgName}
        orgLogo={orgLogo}
        initialLoggedIn={isLoggedIn}
      />
      {!dbAvailable ? (
        <DatabasePausedScreen
          context="registration"
          orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
        />
      ) : maintenance.enabled && !isOwner ? (
        <MaintenanceLockScreen
          context="public"
          message={maintenance.message}
          orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
        />
      ) : (
        children
      )}
    </>
  );
}
