"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  ScrollText,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { useAdminUIStore } from "@/store/useAdminUIStore";

interface AdminSidebarProps {
  orgName?: string;
  orgLogo?: string | null;
}

export default function AdminSidebar({
  orgName = "Portal Panitia",
  orgLogo = null,
}: AdminSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;
  const showSettings = role === "OWNER" || role === "SUPER_ADMIN";
  const isOwner = role === "OWNER";
  const { isSidebarOpen, setSidebarOpen } = useAdminUIStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
    } finally {
      window.location.assign("/login");
    }
  };

  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, setSidebarOpen]);

  const getMenuClass = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    const base =
      "min-h-[44px] px-3 py-2.5 rounded-r-lg border-l-[3px] flex items-center gap-3 text-sm transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#131d1a]";
    if (isActive) {
      return `${base} border-[#006c49] dark:border-[#34d399] bg-[#e6f4ee] dark:bg-[#0c3528] text-[#005236] dark:text-[#6ee7b7] font-semibold`;
    }
    return `${base} border-transparent text-[#4b5850] dark:text-[#cbd6d0] font-medium hover:bg-[#f4f6f8] dark:hover:bg-[#1a2723] hover:text-[#191c1e] dark:hover:text-[#eef2f4]`;
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          aria-hidden="true"
          className="md:hidden fixed inset-0 bg-black/40 dark:bg-black/70 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Navigasi Panel Admin"
        className={`bg-white dark:bg-[#131d1a] border-r border-[#e2e8f0] dark:border-[#3c4d46] h-screen fixed left-0 top-0 w-[260px] flex flex-col z-40 transition-transform duration-200 ease-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#f1f5f9] dark:border-[#3c4d46] shrink-0">
          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 min-w-0 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
          >
            {orgLogo ? (
              <Image
                src={orgLogo}
                alt={orgName}
                width={36}
                height={36}
                unoptimized
                className="w-9 h-9 rounded-lg object-cover border border-[#e2e8f0] dark:border-[#3c4d46] shrink-0 bg-[#f8fafc] dark:bg-[#1a2723]"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#e6f4ee] dark:bg-[#0a3326] text-[#006c49] dark:text-[#34d399] flex items-center justify-center shrink-0 border border-[#cde9dc] dark:border-[#34d399]/35">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#191c1e] dark:text-[#eef2f4] truncate leading-tight">
                {orgName}
              </p>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] truncate leading-tight mt-0.5">
                Panel Administrasi
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu navigasi"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#4b5850] dark:text-[#cbd6d0] hover:bg-[#f4f6f8] dark:hover:bg-[#1a2723] hover:text-[#191c1e] dark:hover:text-[#eef2f4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <CustomScrollArea
          element="nav"
          aria-label="Menu navigasi admin"
          className="flex-1 min-h-0"
          contentClassName="px-3 py-5 space-y-6"
        >
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#52606d] dark:text-[#94a89e] uppercase">
              Utama
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={getMenuClass("/admin", true)}
                >
                  <LayoutDashboard className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                  <span>Ringkasan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/pendaftar"
                  onClick={() => setSidebarOpen(false)}
                  className={getMenuClass("/admin/pendaftar")}
                >
                  <UserPlus className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                  <span>Calon Anggota</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/members"
                  onClick={() => setSidebarOpen(false)}
                  className={getMenuClass("/admin/members")}
                >
                  <Users className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                  <span>Anggota Aktif</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#52606d] dark:text-[#94a89e] uppercase">
              Analitik &amp; Laporan
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin/reports"
                  onClick={() => setSidebarOpen(false)}
                  className={getMenuClass("/admin/reports")}
                >
                  <BarChart3 className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                  <span>Laporan Data</span>
                </Link>
              </li>
            </ul>
          </div>

          {showSettings && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-[#52606d] dark:text-[#94a89e] uppercase">
                Sistem
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/settings?tab=general_settings"
                    onClick={() => setSidebarOpen(false)}
                    className={getMenuClass("/admin/settings")}
                  >
                    <Settings className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                    <span>Pengaturan</span>
                  </Link>
                </li>
                {isOwner && (
                  <li>
                    <Link
                      href="/admin/logs"
                      onClick={() => setSidebarOpen(false)}
                      className={getMenuClass("/admin/logs")}
                    >
                      <ScrollText className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                      <span>Log Aktivitas</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </CustomScrollArea>

        <div className="px-3 py-4 border-t border-[#f1f5f9] dark:border-[#3c4d46] space-y-1 shrink-0">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="min-h-[44px] px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium text-[#4b5850] dark:text-[#cbd6d0] hover:bg-[#f4f6f8] dark:hover:bg-[#1a2723] hover:text-[#191c1e] dark:hover:text-[#eef2f4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
          >
            <Globe className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span>Portal Publik</span>
          </Link>
          <button
            type="button"
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
            onClick={handleLogout}
            className="min-h-[44px] px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium text-[#4b5850] dark:text-[#cbd6d0] hover:bg-[#fef2f2] dark:hover:bg-[#3b1214] hover:text-[#991b1b] dark:hover:text-[#fca5a5] transition-colors w-full text-left cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] dark:focus-visible:ring-[#f87171]"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-[18px] h-[18px] shrink-0 animate-spin" aria-hidden="true" />
                <span>Mengakhiri sesi...</span>
              </>
            ) : (
              <>
                <LogOut className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                <span>Keluar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {isLoggingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-white/80 dark:bg-[#0d1412]/80 backdrop-blur-[2px] px-4"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-6 py-5 shadow-lg text-center max-w-xs w-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4]">
                Mengakhiri sesi...
              </p>
              <p className="text-xs text-[#4b5850] dark:text-[#cbd6d0]">
                Mohon tunggu, sedang mengalihkan ke halaman masuk.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
