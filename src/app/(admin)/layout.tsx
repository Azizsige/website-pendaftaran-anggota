import Link from "next/link";
import { getServerSession } from "next-auth";
import { AlertTriangle } from "lucide-react";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";
import ScrollToTop from "@/components/providers/ScrollToTop";
import { DatabasePausedScreen } from "@/components/system/DatabasePausedScreen";
import { MaintenanceLockScreen } from "@/components/system/MaintenanceLockScreen";
import { authOptions } from "@/lib/auth";
import { ROLES } from "@/lib/constants/roles";
import { getMaintenanceState } from "@/lib/maintenance";
import { SETTING_KEYS } from "@/lib/constants/settings";
import { checkDatabaseAvailable } from "@/lib/db-health";
import { getCachedSettingsMap } from "@/lib/settings-cache";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbAvailable = await checkDatabaseAvailable();

  if (!dbAvailable) {
    return (
      <DatabasePausedScreen
        context="admin"
        showThemeToggle
        orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
      />
    );
  }

  const [session, maintenance] = await Promise.all([
    getServerSession(authOptions),
    getMaintenanceState(),
  ]);
  const userRole = session?.user?.role;
  const isOwner = userRole === ROLES.OWNER;

  if (maintenance.enabled && !isOwner) {
    return (
      <MaintenanceLockScreen
        context="admin"
        message={maintenance.message}
        userRole={userRole}
        showThemeToggle
        orgEmail={process.env.NEXT_PUBLIC_ORG_EMAIL?.trim()}
      />
    );
  }

  let orgName = "Portal Panitia";
  let orgLogo: string | null = null;

  try {
    const map = await getCachedSettingsMap();
    const configuredName = map.get(SETTING_KEYS.ORG_NAME)?.trim();
    const configuredLogo = map.get(SETTING_KEYS.ORG_LOGO)?.trim();
    if (configuredName) orgName = configuredName;
    if (configuredLogo) orgLogo = configuredLogo;
  } catch (err) {
    logger.warn("Gagal memuat identitas organisasi untuk AdminLayout", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return (
    <div className="admin-portal flex min-h-screen bg-[#f4f6f8] dark:bg-[#0d1412] text-[#191c1e] dark:text-[#eef2f4] font-sans">
      <ScrollToTop />
      <AdminSidebar orgName={orgName} orgLogo={orgLogo} />

      <main className="flex-1 flex flex-col md:pl-[260px] min-h-screen w-full min-w-0">
        <AdminHeader />

        {maintenance.enabled && isOwner && (
          <div
            role="status"
            className="border-b border-[#f59e0b]/40 bg-[#fef3c7] px-4 py-2.5 text-xs sm:px-6 lg:px-8 dark:border-[#f59e0b]/45 dark:bg-[#3b2506]"
          >
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 text-[#92400e] dark:text-[#fcd34d]">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Mode Pemeliharaan Darurat sedang AKTIF. Halaman publik dan akses admin selain Owner sedang dikunci.
                </span>
              </div>
              <Link
                href="/admin/logs"
                className="inline-flex min-h-[36px] items-center rounded-lg border border-[#92400e]/30 bg-white/80 px-3 py-1 font-semibold text-[#92400e] transition-colors hover:bg-white dark:border-[#fcd34d]/35 dark:bg-[#1a2723] dark:text-[#fcd34d] dark:hover:bg-[#22322d]"
              >
                Kelola di Log &amp; Sistem
              </Link>
            </div>
          </div>
        )}

        {/* Konten Halaman Admin */}
        {children}
      </main>
    </div>
  );
}
