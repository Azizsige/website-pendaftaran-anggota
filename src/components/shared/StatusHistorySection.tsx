import React from "react";
import { ArrowRight, CalendarClock, Clock, ShieldCheck } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/format";
import type { StatusChangeHistoryItem } from "@/lib/status-history";

interface StatusHistorySectionProps {
  items: StatusChangeHistoryItem[];
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  SUPER_ADMIN: "Super Admin",
  COORDINATOR: "Koordinator",
  STAFF: "Staff",
  SYSTEM: "Sistem Otomatis",
};

/** Timeline audit riwayat perubahan status anggota/pendaftar pada detail admin. */
export function StatusHistorySection({ items }: StatusHistorySectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Riwayat Perubahan Status"
      className="rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          <ShieldCheck
            className="h-4 w-4 text-[#006c49] dark:text-[#34d399]"
            aria-hidden="true"
          />
          <span>Riwayat Perubahan Status ({items.length})</span>
        </h4>
      </div>

      <ol className="space-y-2.5">
        {items.map((item) => {
          const roleLabel = item.changedByRole
            ? ROLE_LABELS[item.changedByRole] || item.changedByRole
            : null;
          const actorText = [item.changedByName || "Pengurus", roleLabel]
            .filter(Boolean)
            .join(" - ");

          return (
            <li
              key={item.id}
              className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 dark:border-[#3c4d46] dark:bg-[#1a2723]"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569] dark:text-[#cbd6d0]">
                <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                  <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {formatDateTime(item.changedAt)} WIB
                </span>
                <span className="font-semibold text-[#0f172a] dark:text-[#eef2f4]">
                  Oleh: {actorText}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  status={item.previousStatus}
                  className="px-2 py-0.5 text-[11px]"
                />
                <ArrowRight
                  className="h-3.5 w-3.5 text-[#64748b] dark:text-[#94a89e]"
                  aria-hidden="true"
                />
                <StatusBadge
                  status={item.newStatus}
                  className="px-2 py-0.5 text-[11px]"
                />
              </div>

              {item.reason && (
                <p className="mt-2 text-xs leading-relaxed text-[#334155] dark:text-[#eef2f4]">
                  Alasan: {item.reason}
                </p>
              )}

              {item.suspendedUntil && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#9a3412] dark:text-[#fdba74]">
                  <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span>
                    Durasi hingga: {formatDateTime(item.suspendedUntil)} WIB
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
