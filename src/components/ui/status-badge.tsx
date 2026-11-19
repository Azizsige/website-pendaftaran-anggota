import * as React from "react";

import { cn } from "@/lib/utils";
import { MEMBER_STATUS } from "@/lib/constants/status";

type BadgeConfig = { label: string; className: string; dot: string };

const STATUS_CONFIG: Record<string, BadgeConfig> = {
  [MEMBER_STATUS.PENDING]: {
    label: "Menunggu",
    className: "bg-[#fef3c7] dark:bg-[#3b2506] text-[#92400e] dark:text-[#fcd34d] border-[#f59e0b]/30 dark:border-[#f59e0b]/45",
    dot: "bg-[#d97706] dark:bg-[#fbbf24]",
  },
  [MEMBER_STATUS.ACTIVE]: {
    label: "Aktif",
    className: "bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] border-[#006c49]/20 dark:border-[#34d399]/35",
    dot: "bg-[#006c49] dark:bg-[#34d399]",
  },
  APPROVED: {
    label: "Disetujui",
    className: "bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] border-[#006c49]/20 dark:border-[#34d399]/35",
    dot: "bg-[#006c49] dark:bg-[#34d399]",
  },
  [MEMBER_STATUS.INACTIVE]: {
    label: "Tidak Aktif",
    className: "bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0] border-[#cbd5e1] dark:border-[#5f736b]",
    dot: "bg-[#64748b] dark:bg-[#94a89e]",
  },
  [MEMBER_STATUS.SUSPENDED]: {
    label: "Dibekukan",
    className: "bg-[#fff7ed] dark:bg-[#431407] text-[#9a3412] dark:text-[#fdba74] border-[#f97316]/35 dark:border-[#fb923c]/40",
    dot: "bg-[#ea580c] dark:bg-[#fb923c]",
  },
  [MEMBER_STATUS.REJECTED]: {
    label: "Ditolak",
    className: "bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5] border-[#ef4444]/25 dark:border-[#f87171]/35",
    dot: "bg-[#dc2626] dark:bg-[#f87171]",
  },
};

const FALLBACK: BadgeConfig = {
  label: "",
  className: "bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0] border-[#cbd5e1] dark:border-[#5f736b]",
  dot: "bg-[#64748b] dark:bg-[#94a89e]",
};

export function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status.toUpperCase()]?.label || status;
}

export interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
}

/** Badge status tunggal untuk anggota, pendaftar, dan admin. */
export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toUpperCase()] ?? FALLBACK;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden />}
      {config.label || status}
    </span>
  );
}
