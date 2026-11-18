import { getServerSession } from "next-auth";
import LandingNavbar from "@/components/layout/LandingNavbar";
import LandingFooter from "@/components/layout/LandingFooter";
import { MaintenanceLockScreen } from "@/components/system/MaintenanceLockScreen";
import "../landing.css";
import { authOptions } from "@/lib/auth";
import { ROLES } from "@/lib/constants/roles";
import { getMaintenanceState, DEFAULT_MAINTENANCE_MESSAGE } from "@/lib/maintenance";
import ScrollToTop from "@/components/providers/ScrollToTop";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = Boolean(session?.user?.id);
  const isOwner = session?.user?.role === ROLES.OWNER;

  let orgName = "Organisasi Mahasiswa";
  let orgLogo = "";
  let orgAddress = "";
  let orgEmail = "";
  let orgWhatsapp = "";
  let orgInstagram = "";
  let maintenance = { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE };

  try {
    const dbAvailable = await checkDatabaseAvailable();
    if (dbAvailable) {
      const [map, maintenanceState] = await Promise.all([
        getCachedSettingsMap(),
        getMaintenanceState(),
      ]);
      maintenance = maintenanceState;

      if (map.get(SETTING_KEYS.ORG_NAME)) orgName = map.get(SETTING_KEYS.ORG_NAME)!;
      if (map.get(SETTING_KEYS.ORG_LOGO)) orgLogo = map.get(SETTING_KEYS.ORG_LOGO)!;
      if (map.get(SETTING_KEYS.ORG_ADDRESS)) orgAddress = map.get(SETTING_KEYS.ORG_ADDRESS)!;
      if (map.get(SETTING_KEYS.ORG_EMAIL)) orgEmail = map.get(SETTING_KEYS.ORG_EMAIL)!;
      if (map.get(SETTING_KEYS.ORG_WHATSAPP)) orgWhatsapp = map.get(SETTING_KEYS.ORG_WHATSAPP)!;
      if (map.get(SETTING_KEYS.ORG_INSTAGRAM)) orgInstagram = map.get(SETTING_KEYS.ORG_INSTAGRAM)!;
    }
  } catch (error) {
    logger.error("Failed to load layout settings:", error);
  }

  const isLockedByMaintenance = maintenance.enabled && !isOwner;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <ScrollToTop />
      <LandingNavbar
        orgName={orgName}
        orgLogo={orgLogo}
        initialLoggedIn={isLoggedIn}
      />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {isLockedByMaintenance ? (
          <MaintenanceLockScreen
            context="public"
            message={maintenance.message}
            orgEmail={orgEmail || process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
          />
        ) : (
          children
        )}
      </main>
      <LandingFooter
        orgName={orgName}
        orgLogo={orgLogo}
        orgAddress={orgAddress}
        orgEmail={orgEmail}
        orgWhatsapp={orgWhatsapp}
        orgInstagram={orgInstagram}
      />
    </>
  );
}
