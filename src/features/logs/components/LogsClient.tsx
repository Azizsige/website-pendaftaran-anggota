"use client";

import React, { useState } from "react";
import { Eye, RefreshCw, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { formatDate } from "@/lib/format";
import { pruneActivityLogs } from "../actions";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_LABELS,
  ACTIVITY_ENTITY_LABELS,
  ACTIVITY_LOGS_PAGE_SIZE,
  type ActivityLogItem,
  type SystemDiagnostics,
} from "../types";
import { SystemHealthPanel } from "./SystemHealthPanel";

interface LogsClientProps {
  initialLogs: ActivityLogItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  diagnostics: SystemDiagnostics;
  search: string;
  role: string;
  category: string;
}

const ROLE_OPTIONS: DropdownOption[] = [
  { label: "Semua Peran", value: "all" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Koordinator", value: "COORDINATOR" },
  { label: "Staff", value: "STAFF" },
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: "Semua Modul", value: "all" },
  { label: "Keamanan & Hak Akses", value: "SECURITY" },
  { label: "Autentikasi & Sesi", value: "AUTH" },
  { label: "Navigasi & Ekspor", value: "NAVIGATION" },
  { label: "Verifikasi Pendaftar", value: "APPLICANT" },
  { label: "Data Anggota", value: "MEMBER" },
  { label: "Manajemen Admin", value: "ADMIN" },
  { label: "Pengaturan Sistem", value: "SETTINGS" },
];

const QUICK_FILTER_TABS = [
  { label: "Semua Aktivitas", value: "all" },
  { label: "Peringatan Keamanan", value: "SECURITY" },
  { label: "Autentikasi", value: "AUTH" },
  { label: "Navigasi & Ekspor", value: "NAVIGATION" },
] as const;

const RETENTION_OPTIONS = [
  { label: "Hapus log lebih dari 30 hari", value: 30 },
  { label: "Hapus log lebih dari 7 hari", value: 7 },
  { label: "Kosongkan seluruh log non-Owner", value: 0 },
] as const;

const ROLE_BADGE_MAP: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    className:
      "border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af] dark:border-[#60a5fa]/35 dark:bg-[#132544] dark:text-[#93c5fd]",
  },
  COORDINATOR: {
    label: "Koordinator",
    className:
      "border-[#006c49]/20 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]",
  },
  STAFF: {
    label: "Staff",
    className:
      "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155] dark:border-[#5f736b] dark:bg-[#1e2d28] dark:text-[#cbd6d0]",
  },
  MEMBER: {
    label: "Anggota",
    className:
      "border-[#f59e0b]/30 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]",
  },
};

function resolveActionBadgeClass(action: string): string {
  if (
    action === ACTIVITY_ACTIONS.UNAUTHORIZED_ACCESS ||
    action === ACTIVITY_ACTIONS.LOGIN_FAILED ||
    action === ACTIVITY_ACTIONS.REJECT_APPLICANT ||
    action === ACTIVITY_ACTIONS.DELETE_APPLICANT ||
    action === ACTIVITY_ACTIONS.DELETE_MEMBER ||
    action === ACTIVITY_ACTIONS.DELETE_ADMIN
  ) {
    return "border-[#ef4444]/30 bg-[#fef2f2] text-[#991b1b] dark:border-[#f87171]/45 dark:bg-[#3b1214] dark:text-[#fca5a5]";
  }
  if (
    action === ACTIVITY_ACTIONS.LOGIN ||
    action === ACTIVITY_ACTIONS.APPROVE_APPLICANT ||
    action === ACTIVITY_ACTIONS.CREATE_MEMBER ||
    action === ACTIVITY_ACTIONS.CREATE_ADMIN
  ) {
    return "border-[#006c49]/25 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/40 dark:bg-[#0a3326] dark:text-[#6ee7b7]";
  }
  if (
    action === ACTIVITY_ACTIONS.LOGOUT ||
    action === ACTIVITY_ACTIONS.SUSPEND_APPLICANT ||
    action === ACTIVITY_ACTIONS.UPDATE_SETTING ||
    action === ACTIVITY_ACTIONS.UPDATE_MULTIPLE_SETTINGS
  ) {
    return "border-[#f59e0b]/35 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]";
  }
  if (
    action === ACTIVITY_ACTIONS.VIEW_PAGE ||
    action === ACTIVITY_ACTIONS.VIEW_APPLICANT_DETAIL
  ) {
    return "border-[#06b6d4]/35 bg-[#ecfeff] text-[#155e75] dark:border-[#22d3ee]/40 dark:bg-[#083344] dark:text-[#67e8f9]";
  }
  if (
    action === ACTIVITY_ACTIONS.EXPORT_APPLICANTS ||
    action === ACTIVITY_ACTIONS.EXPORT_MEMBERS ||
    action === ACTIVITY_ACTIONS.EXPORT_REPORTS ||
    action === ACTIVITY_ACTIONS.UPDATE_APPLICANT_STATUS ||
    action === ACTIVITY_ACTIONS.UPDATE_APPLICANT_NOTES ||
    action === ACTIVITY_ACTIONS.UPDATE_MEMBER ||
    action === ACTIVITY_ACTIONS.UPDATE_MEMBER_STATUS ||
    action === ACTIVITY_ACTIONS.UPDATE_ADMIN
  ) {
    return "border-[#3b82f6]/30 bg-[#eff6ff] text-[#1e40af] dark:border-[#60a5fa]/40 dark:bg-[#132544] dark:text-[#93c5fd]";
  }
  return "border-[#cbd5e1] bg-[#f8fafc] text-[#334155] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#cbd6d0]";
}

function resolveEntityBadgeClass(entityType: string | null): {
  badgeClass: string;
  dotClass: string;
} {
  if (entityType === "Security") {
    return {
      badgeClass:
        "border-[#ef4444]/30 bg-[#fef2f2] text-[#991b1b] dark:border-[#f87171]/45 dark:bg-[#3b1214] dark:text-[#fca5a5]",
      dotClass: "bg-[#dc2626] dark:bg-[#f87171]",
    };
  }
  if (entityType === "Auth") {
    return {
      badgeClass:
        "border-[#006c49]/25 bg-[#e6f4ee] text-[#005236] dark:border-[#34d399]/40 dark:bg-[#0a3326] dark:text-[#6ee7b7]",
      dotClass: "bg-[#006c49] dark:bg-[#34d399]",
    };
  }
  if (entityType === "Navigation") {
    return {
      badgeClass:
        "border-[#06b6d4]/35 bg-[#ecfeff] text-[#155e75] dark:border-[#22d3ee]/40 dark:bg-[#083344] dark:text-[#67e8f9]",
      dotClass: "bg-[#0891b2] dark:bg-[#22d3ee]",
    };
  }
  if (entityType === "SystemSetting") {
    return {
      badgeClass:
        "border-[#f59e0b]/35 bg-[#fef3c7] text-[#92400e] dark:border-[#f59e0b]/45 dark:bg-[#3b2506] dark:text-[#fcd34d]",
      dotClass: "bg-[#d97706] dark:bg-[#fbbf24]",
    };
  }
  if (entityType === "Export" || entityType === "MemberProfile" || entityType === "User") {
    return {
      badgeClass:
        "border-[#3b82f6]/30 bg-[#eff6ff] text-[#1e40af] dark:border-[#60a5fa]/40 dark:bg-[#132544] dark:text-[#93c5fd]",
      dotClass: "bg-[#2563eb] dark:bg-[#60a5fa]",
    };
  }
  return {
    badgeClass:
      "border-[#cbd5e1] bg-[#f8fafc] text-[#334155] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#cbd6d0]",
    dotClass: "bg-[#64748b] dark:bg-[#94a89e]",
  };
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "AD";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function LogsClient({
  initialLogs,
  totalCount,
  totalPages,
  currentPage,
  diagnostics,
  search,
  role,
  category,
}: LogsClientProps) {
  const {
    searchTerm,
    setSearchTerm,
    setPage,
    updateUrl,
    isPending,
    startTransition,
    refresh,
  } = useTableUrlState(search);

  const [isPruneOpen, setIsPruneOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [isPruning, setIsPruning] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const normalizedCategory = category.toUpperCase();
  const activeQuickTab =
    normalizedCategory === "SECURITY" ||
    normalizedCategory === "AUTH" ||
    normalizedCategory === "NAVIGATION"
      ? normalizedCategory
      : category === "all"
      ? "all"
      : "";

  const hasActiveFilters = Boolean(search.trim()) || role !== "all" || category !== "all";

  const handleRoleChange = (nextRole: string) => {
    updateUrl({ role: nextRole === "all" ? null : nextRole, page: "1" });
  };

  const handleCategoryChange = (nextCategory: string) => {
    updateUrl({ category: nextCategory === "all" ? null : nextCategory, page: "1" });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    updateUrl({ search: null, role: null, category: null, page: null });
  };

  const handleRefresh = () => {
    startTransition(() => {
      refresh();
    });
  };

  const handleConfirmPrune = async () => {
    setIsPruning(true);
    try {
      const res = await pruneActivityLogs(retentionDays);
      if (!res.success) {
        toast.error(res.error || "Gagal membersihkan log aktivitas.");
        return;
      }
      const deletedCount = res.deletedCount ?? 0;
      if (deletedCount === 0) {
        toast.info("Tidak ada log dalam rentang waktu tersebut untuk dihapus.");
      } else {
        toast.success(`${deletedCount} catatan aktivitas berhasil dibersihkan.`);
      }
      setIsPruneOpen(false);
      refresh();
    } finally {
      setIsPruning(false);
    }
  };

  const columns: DataTableColumn<ActivityLogItem>[] = [
    {
      key: "createdAt",
      header: "Waktu",
      headerClassName: "min-w-[165px]",
      className: "whitespace-nowrap",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
            {formatDate(item.createdAt, "d MMM yyyy")}
          </span>
          <span className="font-mono text-xs text-[#52606d] tabular-nums dark:text-[#94a89e]">
            {formatDate(item.createdAt, "HH:mm:ss")} WIB
          </span>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Pelaku Aktivitas",
      headerClassName: "min-w-[210px]",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#006c49]/15 bg-[#e6f4ee] text-xs font-semibold text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
          >
            {getInitials(item.user.name)}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium text-[#0f172a] dark:text-[#eef2f4]">
              {item.user.name || "Tanpa Nama"}
            </span>
            <span className="truncate text-xs text-[#52606d] dark:text-[#94a89e]">
              {item.user.email || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran",
      headerClassName: "w-36 min-w-[125px]",
      cell: (item) => {
        const badge = ROLE_BADGE_MAP[item.user.role] ?? {
          label: item.user.role,
          className:
            "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155] dark:border-[#5f736b] dark:bg-[#1e2d28] dark:text-[#cbd6d0]",
        };
        return (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "Tindakan & Modul",
      headerClassName: "min-w-[225px]",
      cell: (item) => {
        const actionLabel = ACTIVITY_ACTION_LABELS[item.action] || item.action;
        const entityLabel =
          (item.entityType && ACTIVITY_ENTITY_LABELS[item.entityType]) ||
          item.entityType ||
          "Sistem";
        const entityStyle = resolveEntityBadgeClass(item.entityType);
        return (
          <div className="flex flex-col items-start gap-1.5">
            <span
              className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${resolveActionBadgeClass(
                item.action
              )}`}
            >
              {actionLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${entityStyle.badgeClass}`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${entityStyle.dotClass}`}
              />
              <span>Modul: {entityLabel}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: "details",
      header: "Rincian Aktivitas",
      headerClassName: "min-w-[270px]",
      cell: (item) => (
        <div className="flex flex-col gap-1">
          <p className="line-clamp-2 text-[13px] leading-snug text-[#334155] dark:text-[#cbd6d0]">
            {item.details || "Tidak ada rincian tambahan."}
          </p>
          {item.entityId && (
            <span className="font-mono text-[11px] text-[#52606d] dark:text-[#94a89e]">
              Target: {item.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "inspect",
      header: <span className="block text-right">Aksi</span>,
      headerClassName: "w-28 text-right",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedLog(item)}
            aria-label={`Lihat rincian log ${item.id}`}
            className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            <span>Rincian</span>
          </button>
        </div>
      ),
    },
  ];

  const selectedRoleBadge = selectedLog
    ? ROLE_BADGE_MAP[selectedLog.user.role] ?? {
        label: selectedLog.user.role,
        className:
          "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155] dark:border-[#5f736b] dark:bg-[#1e2d28] dark:text-[#cbd6d0]",
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <SystemHealthPanel diagnostics={diagnostics} />

      <div className="flex flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <div className="flex flex-col gap-4 border-b border-[#f1f5f9] bg-white px-5 py-4 sm:px-6 dark:border-[#24332d] dark:bg-[#131d1a]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                Riwayat Aktivitas &amp; Keamanan Pengelola
              </h2>
              <p className="mt-0.5 text-xs text-[#52606d] dark:text-[#94a89e]">
                Merekam login, logout, gagal masuk, percobaan akses terlarang, kunjungan halaman, ekspor data, dan mutasi oleh akun selain Owner.
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#334155] tabular-nums dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
              {totalCount.toLocaleString("id-ID")} catatan
            </span>
          </div>

          <div
            role="group"
            aria-label="Filter cepat kategori aktivitas"
            className="flex flex-wrap items-center gap-2"
          >
            {QUICK_FILTER_TABS.map((tab) => {
              const isActive = activeQuickTab === tab.value;
              const isSecurityTab = tab.value === "SECURITY";
              const alertCount = diagnostics.counts.securityAlertsCount;

              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryChange(tab.value)}
                  className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:focus-visible:ring-[#34d399] ${
                    isActive
                      ? isSecurityTab
                        ? "border-[#dc2626]/35 bg-[#fef2f2] text-[#991b1b] dark:border-[#f87171]/45 dark:bg-[#3b1214] dark:text-[#fca5a5]"
                        : "border-[#006c49] bg-[#e6f4ee] text-[#005236] dark:border-[#34d399] dark:bg-[#0c3528] dark:text-[#6ee7b7]"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#334155] hover:bg-[#f1f5f9] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:bg-[#22322d]"
                  }`}
                >
                  {isSecurityTab && <ShieldAlert className="h-3.5 w-3.5" aria-hidden />}
                  <span>{tab.label}</span>
                  {isSecurityTab && alertCount > 0 && (
                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-md bg-[#dc2626] px-1.5 py-0.5 text-[11px] font-bold text-white tabular-nums">
                      {alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 xl:flex-row xl:items-center">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="group relative w-full min-w-0 flex-1 sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52606d] transition-colors group-focus-within:text-[#006c49] dark:text-[#94a89e] dark:group-focus-within:text-[#34d399]"
                  aria-hidden
                />
                <input
                  type="text"
                  aria-label="Cari pelaku, email, atau rincian aktivitas"
                  placeholder="Cari nama, email, IP, rute, atau rincian..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-h-[44px] w-full min-w-0 rounded-lg border border-[#85929f] bg-white py-2 pl-10 pr-11 text-sm text-[#0f172a] placeholder:text-[#52606d] transition-colors hover:border-[#64748b] focus:border-[#006c49] focus:outline-none focus:ring-2 focus:ring-[#006c49]/15 dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:placeholder:text-[#94a89e] dark:hover:border-[#94a89e] dark:focus:border-[#34d399] dark:focus:ring-[#34d399]/25"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Hapus kata kunci pencarian"
                    className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#52606d] transition-colors hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:text-[#94a89e] dark:hover:text-[#eef2f4] dark:focus-visible:ring-[#34d399]"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
                <div className="w-full sm:w-[175px]">
                  <Dropdown
                    value={role}
                    options={ROLE_OPTIONS}
                    onChange={handleRoleChange}
                    placeholder="Filter Peran"
                  />
                </div>
                <div className="w-full sm:w-[215px]">
                  <Dropdown
                    value={category}
                    options={CATEGORY_OPTIONS}
                    onChange={handleCategoryChange}
                    placeholder="Filter Modul"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isPending}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                  aria-hidden
                />
                <span>Muat Ulang</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPruneOpen(true)}
                disabled={diagnostics.counts.totalLogsNonOwner === 0 || isPruning}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dc2626]/35 bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#991b1b] transition-colors hover:bg-[#fee2e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#f87171]/40 dark:bg-[#3b1214] dark:text-[#fca5a5] dark:hover:bg-[#531a1d] dark:focus-visible:ring-[#f87171]"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                <span>Bersihkan Log</span>
              </button>
            </div>
          </div>
        </div>

        {!isPending && initialLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <p className="max-w-md text-sm leading-relaxed text-[#475569] dark:text-[#cbd6d0]">
              {hasActiveFilters
                ? "Tidak ada catatan aktivitas yang sesuai dengan filter atau kata kunci pencarian saat ini."
                : "Belum ada aktivitas pengelola non-Owner yang terekam. Setiap aktivitas login, kunjungan halaman, ekspor data, percobaan akses ditolak, atau perubahan data akan muncul di tabel ini."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={initialLogs}
            getRowKey={(item) => item.id}
            isLoading={isPending}
            tableClassName="min-w-[1120px]"
            footer={
              totalCount > 0 ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={ACTIVITY_LOGS_PAGE_SIZE}
                  onPageChange={setPage}
                  isPending={isPending}
                />
              ) : null
            }
          />
        )}
      </div>

      <Dialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      >
        <DialogContent className="max-w-[580px] rounded-2xl border border-[#e2e8f0] bg-white p-0 dark:border-[#3c4d46] dark:bg-[#131d1a]">
          {selectedLog && (
            <div className="p-6 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#f1f5f9] pb-4 dark:border-[#24332d]">
                <div>
                  <DialogTitle className="text-lg font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                    Detail Catatan Audit
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs text-[#52606d] dark:text-[#94a89e]">
                    Rekaman lengkap aktivitas dan metadata pelaku pada sistem.
                  </DialogDescription>
                </div>
                <DialogClose
                  aria-label="Tutup detail catatan audit"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:text-[#cbd6d0] dark:hover:bg-[#1a2723] dark:hover:text-[#eef2f4] dark:focus-visible:ring-[#34d399]"
                >
                  <X className="h-5 w-5" aria-hidden />
                </DialogClose>
              </div>

              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    ID Log
                  </dt>
                  <dd className="break-all font-mono text-xs text-[#0f172a] dark:text-[#eef2f4]">
                    {selectedLog.id}
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Waktu Presisi
                  </dt>
                  <dd className="font-mono text-xs font-medium text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
                    {formatDate(selectedLog.createdAt, "d MMMM yyyy, HH:mm:ss")} WIB
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Pelaku Akun
                  </dt>
                  <dd className="font-medium text-[#0f172a] dark:text-[#eef2f4]">
                    {selectedLog.user.name || "Tanpa Nama"}
                    <span className="block text-xs font-normal text-[#52606d] dark:text-[#94a89e]">
                      {selectedLog.user.email || "-"}
                    </span>
                  </dd>
                </div>

                <div className="flex flex-col gap-1.5">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Peran &amp; Status Akun
                  </dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    {selectedRoleBadge && (
                      <span
                        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${selectedRoleBadge.className}`}
                      >
                        {selectedRoleBadge.label}
                      </span>
                    )}
                    <StatusBadge status={selectedLog.user.status} />
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Tindakan &amp; Kode Aksi
                  </dt>
                  <dd className="flex flex-col items-start gap-1">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${resolveActionBadgeClass(
                        selectedLog.action
                      )}`}
                    >
                      {ACTIVITY_ACTION_LABELS[selectedLog.action] || selectedLog.action}
                    </span>
                    <span className="font-mono text-xs text-[#52606d] dark:text-[#94a89e]">
                      {selectedLog.action}
                    </span>
                  </dd>
                </div>

                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Modul &amp; Target
                  </dt>
                  <dd className="flex flex-col items-start gap-1 text-xs text-[#0f172a] dark:text-[#eef2f4]">
                    {(() => {
                      const entityStyle = resolveEntityBadgeClass(selectedLog.entityType);
                      const entityLabel =
                        (selectedLog.entityType &&
                          ACTIVITY_ENTITY_LABELS[selectedLog.entityType]) ||
                        selectedLog.entityType ||
                        "Sistem";
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${entityStyle.badgeClass}`}
                        >
                          <span
                            aria-hidden
                            className={`h-1.5 w-1.5 rounded-full ${entityStyle.dotClass}`}
                          />
                          <span>{entityLabel}</span>
                        </span>
                      );
                    })()}
                    <span className="break-all font-mono text-[#52606d] dark:text-[#94a89e]">
                      {selectedLog.entityId || "-"}
                    </span>
                  </dd>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                    Rincian Lengkap
                  </dt>
                  <dd className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3.5 text-sm leading-relaxed text-[#0f172a] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#eef2f4]">
                    {selectedLog.details || "Tidak ada rincian tambahan."}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex justify-end border-t border-[#f1f5f9] pt-4 dark:border-[#24332d]">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="min-h-[44px] cursor-pointer rounded-lg border border-[#85929f] bg-white px-5 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isPruneOpen}
        onOpenChange={(open) => {
          if (!isPruning) setIsPruneOpen(open);
        }}
        tone="danger"
        icon="delete_forever"
        title="Bersihkan Catatan Log Aktivitas?"
        description="Pemeliharaan kapasitas tabel ActivityLog"
        message="Pilih rentang usia catatan log non-Owner yang ingin dihapus permanen untuk menjaga ukuran basis data tetap ringan."
        confirmLabel="Ya, Bersihkan Log"
        cancelLabel="Batal"
        acknowledgement="Saya memahami bahwa riwayat log yang dihapus tidak dapat dipulihkan."
        isPending={isPruning}
        pendingTitle="Membersihkan Log"
        pendingMessage="Sedang menghapus catatan aktivitas lama..."
        onConfirm={handleConfirmPrune}
      >
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Pilih rentang usia log">
          {RETENTION_OPTIONS.map((option) => {
            const isSelected = retentionDays === option.value;
            return (
              <label
                key={option.value}
                className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "border-[#006c49] bg-[#e6f4ee] font-semibold text-[#005236] dark:border-[#34d399] dark:bg-[#0a3326] dark:text-[#6ee7b7]"
                    : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0] dark:hover:bg-[#22322d]"
                }`}
              >
                <input
                  type="radio"
                  name="retentionDays"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setRetentionDays(option.value)}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#006c49] dark:accent-[#10b981]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </ConfirmDialog>
    </div>
  );
}
