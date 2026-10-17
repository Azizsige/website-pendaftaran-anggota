import * as React from "react";

import { cn } from "@/lib/utils";
import { MEMBER_STATUS } from "@/lib/constants/status";

type BadgeConfig = { label: string; className: string; dot: string };

const STATUS_CONFIG: Record<string, BadgeConfig> = {
  [MEMBER_STATUS.PENDING]: {
    label: "Menunggu",
    className: "bg-[#fff8e1] text-[#f57f17] border-[#f57f17]/20",
    dot: "bg-[#f57f17]",
  },
  [MEMBER_STATUS.ACTIVE]: {
    label: "Aktif",
    className: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  [MEMBER_STATUS.INACTIVE]: {
    label: "Tidak Aktif",
    className: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
    dot: "bg-on-surface-variant",
  },
  [MEMBER_STATUS.SUSPENDED]: {
    label: "Dibekukan",
    className: "bg-error/10 text-error border-error/20",
    dot: "bg-error",
  },
  [MEMBER_STATUS.REJECTED]: {
    label: "Ditolak",
    className: "bg-error/10 text-error border-error/20",
    dot: "bg-error",
  },
};

const FALLBACK: BadgeConfig = {
  label: "",
  className: "bg-surface-container-highest text-on-surface-variant border-transparent",
  dot: "bg-outline",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden />}
      {config.label || status}
    </span>
  );
}
