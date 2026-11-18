"use client";

import React from "react";
import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";

import { LoadingWaveDots } from "@/components/ui/loading-wave-dots";
import type { ReportSummary } from "../queries";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  loading: boolean;
}

export function ReportSummaryCards({ summary, loading }: ReportSummaryCardsProps) {
  const cards = [
    {
      label: "Total Pendaftar (Tersaring)",
      value: summary.total,
      icon: Users,
      iconBg:
        "bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-[#1e2d28] dark:text-[#cbd6d0] dark:border-[#5f736b]",
      valueColor: "text-[#0f172a] dark:text-[#eef2f4]",
    },
    {
      label: "Disetujui / Aktif",
      value: summary.approved,
      icon: CheckCircle2,
      iconBg:
        "bg-[#e6f4ee] text-[#005236] border-[#006c49]/20 dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:border-[#34d399]/35",
      valueColor: "text-[#005236] dark:text-[#34d399]",
    },
    {
      label: "Menunggu Verifikasi",
      value: summary.pending,
      icon: Clock,
      iconBg:
        "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/25 dark:bg-[#3b2506] dark:text-[#fcd34d] dark:border-[#f59e0b]/40",
      valueColor: "text-[#92400e] dark:text-[#fbbf24]",
    },
    {
      label: "Ditolak / Dibekukan",
      value: summary.rejected,
      icon: XCircle,
      iconBg:
        "bg-[#fef2f2] text-[#991b1b] border-[#dc2626]/20 dark:bg-[#3b1214] dark:text-[#fca5a5] dark:border-[#f87171]/40",
      valueColor: "text-[#991b1b] dark:text-[#fca5a5]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex items-start justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white p-5 dark:border-[#3c4d46] dark:bg-[#131d1a]"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                {card.label}
              </span>
              <span
                className={`inline-flex min-h-[32px] sm:min-h-[36px] items-center text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${card.valueColor}`}
              >
                {loading ? (
                  <LoadingWaveDots size="lg" label={`Memuat ${card.label}`} />
                ) : (
                  card.value.toLocaleString("id-ID")
                )}
              </span>
            </div>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${card.iconBg}`}
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
