import * as React from "react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export function formatRegistrationId(id: string): string {
  if (id.startsWith("REG-")) return id;
  return `REG-${id.slice(-8).toUpperCase()}`;
}

export interface PersonSummaryProps {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  id: string;
  status?: string;
  statusLabel?: string;
  className?: string;
}

/** Kartu ringkas anggota/pendaftar yang tampil di dialog konfirmasi. */
export function PersonSummary({
  name,
  email,
  phone,
  phoneNumber,
  id,
  status,
  className,
}: PersonSummaryProps) {
  const displayPhone = phone || phoneNumber;
  const initials = name?.substring(0, 2).toUpperCase() || "NA";

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/20 bg-surface-container-low p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high text-sm font-bold text-on-surface">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-on-surface">{name || "N/A"}</h4>
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 tracking-wide">
              {formatRegistrationId(id)}
            </span>
          </div>
          <p className="mb-2 truncate text-xs text-on-surface-variant">
            {email || "-"} {displayPhone ? `• ${displayPhone}` : ""}
          </p>
          {status && (
            <div className="flex items-center gap-2 border-t border-outline-variant/10 pt-2">
              <span className="text-[11px] text-on-surface-variant/70">Status saat ini:</span>
              <StatusBadge status={status} className="px-2 py-0.5 text-[11px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
