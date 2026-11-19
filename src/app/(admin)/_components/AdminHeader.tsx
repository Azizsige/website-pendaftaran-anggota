"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Menu, Search } from "lucide-react";
import { useAdminUIStore } from "@/store/useAdminUIStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { trackAdminActivity } from "@/features/logs/actions";

function resolveBreadcrumbLabel(pathname: string | null): string {
  if (!pathname || pathname === "/admin") return "Ringkasan";
  if (pathname.startsWith("/admin/pendaftar")) return "Calon Anggota";
  if (pathname.startsWith("/admin/members")) return "Anggota Aktif";
  if (pathname.startsWith("/admin/reports")) return "Laporan Data";
  if (pathname.startsWith("/admin/settings")) return "Pengaturan";
  if (pathname.startsWith("/admin/logs")) return "Log Aktivitas";
  return "Ringkasan";
}

function resolveRoleLabel(role?: string): string {
  if (role === "OWNER") return "Pembina";
  if (role === "SUPER_ADMIN") return "Super Admin";
  return "Panitia";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "AD";
}

export default function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useAdminUIStore();
  const [searchTerm, setSearchTerm] = useState("");
  const lastTrackedPathRef = useRef<string | null>(null);

  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const userName = session?.user?.name?.trim() || "Admin Panitia";
  const roleLabel = resolveRoleLabel(userRole);
  const currentLabel = resolveBreadcrumbLabel(pathname);

  useEffect(() => {
    if (!userId || !userRole || userRole === "OWNER" || !pathname) return;
    if (pathname.startsWith("/admin/logs")) return;
    if (lastTrackedPathRef.current === pathname) return;

    lastTrackedPathRef.current = pathname;
    const pageTitle = resolveBreadcrumbLabel(pathname);
    void trackAdminActivity({
      action: "VIEW_PAGE",
      entityType: "Navigation",
      entityId: pathname,
      details: `Membuka halaman ${pageTitle} (${pathname})`,
    });
  }, [pathname, userId, userRole]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/admin/pendaftar?search=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/admin/pendaftar");
  };

  return (
    <header className="bg-white dark:bg-[#131d1a] border-b border-[#e2e8f0] dark:border-[#3c4d46] sticky top-0 z-20 transition-colors">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Buka menu navigasi"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#4b5850] dark:text-[#cbd6d0] hover:bg-[#f4f6f8] dark:hover:bg-[#1a2723] hover:text-[#191c1e] dark:hover:text-[#eef2f4] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <nav
            aria-label="Breadcrumb"
            className="hidden lg:flex items-center text-sm text-[#52606d] dark:text-[#94a89e]"
          >
            <ol className="inline-flex items-center gap-1.5">
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#006c49] dark:hover:text-[#34d399] transition-colors font-medium rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399]"
                >
                  Panel Admin
                </Link>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ChevronRight
                  className="w-4 h-4 text-[#52606d] dark:text-[#94a89e]"
                  aria-hidden="true"
                />
                <span className="text-[#191c1e] dark:text-[#eef2f4] font-semibold">
                  {currentLabel}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 lg:flex-initial justify-end min-w-0">
          {/* <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="relative flex items-center w-full max-w-[230px] sm:w-64 md:w-72"
          >
            <Search
              className="w-4 h-4 text-[#4b5850] dark:text-[#94a89e] absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama atau NIM..."
              aria-label="Cari pendaftar berdasarkan nama atau NIM"
              className="w-full min-h-[44px] pl-10 pr-3 py-2 text-sm bg-[#f8fafc] dark:bg-[#1a2723] text-[#191c1e] dark:text-[#eef2f4] placeholder:text-[#52606d] dark:placeholder:text-[#94a89e] border border-[#cbd5e1] dark:border-[#5f736b] rounded-lg focus:outline-none focus:bg-white dark:focus:bg-[#131d1a] focus:border-[#006c49] dark:focus:border-[#34d399] focus:ring-2 focus:ring-[#006c49]/15 dark:focus:ring-[#34d399]/25 transition-colors"
            />
          </form> */}

          <ThemeToggle />

          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8f0] dark:border-[#3c4d46] shrink-0">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4] max-w-[140px] truncate">
                {userName}
              </span>
              <span className="text-xs text-[#52606d] dark:text-[#94a89e]">{roleLabel}</span>
            </div>
            <div
              title={`${userName} (${roleLabel})`}
              className="w-10 h-10 rounded-full bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] border border-[#cde9dc] dark:border-[#34d399]/35 flex items-center justify-center font-bold text-xs shrink-0"
            >
              {getInitials(userName)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
