import React from "react";
import { Clock, History } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import type { PublicRejectionHistoryItem } from "@/lib/rejection-history";

interface RejectionHistoryEntry extends PublicRejectionHistoryItem {
  rejectedByName?: string | null;
}

interface RejectionHistorySectionProps {
  items: RejectionHistoryEntry[];
  variant?: "admin" | "public";
}

/** Daftar riwayat penolakan pendaftar (tanggal & alasan) untuk admin maupun portal cek status. */
export function RejectionHistorySection({
  items,
  variant = "admin",
}: RejectionHistorySectionProps) {
  if (!items || items.length === 0) return null;

  const isAdmin = variant === "admin";

  return (
    <section
      aria-label="Riwayat Penolakan"
      className={
        isAdmin
          ? "rounded-xl border border-[#fecaca] bg-white p-5 dark:border-[#f87171]/35 dark:bg-[#131d1a]"
          : "mb-6 rounded-xl border border-[#fecaca] bg-[#fef2f2]/70 p-4 dark:border-[#f87171]/35 dark:bg-[#3b1214]/60"
      }
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0f172a] dark:text-[#eef2f4]">
          <History
            className="h-4 w-4 text-[#b91c1c] dark:text-[#fca5a5]"
            aria-hidden="true"
          />
          <span>Riwayat Penolakan ({items.length})</span>
        </h4>
      </div>

      <ol className="space-y-2.5">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="rounded-lg border border-[#fecaca]/80 bg-[#fef2f2] p-3 dark:border-[#f87171]/30 dark:bg-[#3b1214]"
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-[#7f1d1d] dark:text-[#fecaca]">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                {formatDateTime(item.rejectedAt)} WIB
              </span>
              <span className="rounded bg-white/80 px-1.5 py-0.5 font-semibold text-[#991b1b] dark:bg-[#1a0b0d] dark:text-[#fca5a5]">
                Penolakan #{items.length - index}
                {isAdmin && item.rejectedByName ? ` (${item.rejectedByName})` : ""}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#7f1d1d] dark:text-[#fee2e2]">
              {item.reason}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
