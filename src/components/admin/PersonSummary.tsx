import * as React from "react";

import { cn } from "@/lib/utils";
import { normalizeIndonesianPhone } from "@/lib/format";
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
  const displayPhone = normalizeIndonesianPhone(phone || phoneNumber);
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "AG";

  return (
    <div
      className={cn(
        "rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] bg-[#f8fafc] dark:bg-[#1a2723] p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#006c49]/15 dark:border-[#34d399]/35 bg-[#e6f4ee] dark:bg-[#0a3326] text-xs font-bold text-[#005236] dark:text-[#6ee7b7]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
              {name || "Tanpa Nama"}
            </h4>
            <span className="inline-flex items-center rounded-md border border-[#e2e8f0] dark:border-[#3c4d46] bg-white dark:bg-[#131d1a] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-[#334155] dark:text-[#cbd6d0]">
              {formatRegistrationId(id)}
            </span>
          </div>
          <p className="mb-2 truncate text-xs text-[#475569] dark:text-[#cbd6d0]">
            {email || "-"} {displayPhone ? `| ${displayPhone}` : ""}
          </p>
          {status && (
            <div className="flex items-center gap-2 border-t border-[#e2e8f0] dark:border-[#3c4d46] pt-2">
              <span className="text-[11px] text-[#64748b] dark:text-[#94a89e]">Status saat ini:</span>
              <StatusBadge status={status} className="px-2 py-0.5 text-[11px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
