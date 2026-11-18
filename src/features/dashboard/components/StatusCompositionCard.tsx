"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useTheme } from "@/components/providers/ThemeProvider";

interface StatusCompositionCardProps {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  pendingQueue: number;
}

export default function StatusCompositionCard({
  approved,
  pending,
  rejected,
  total,
  pendingQueue,
}: StatusCompositionCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const size = 168;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    {
      label: "Disetujui",
      count: approved,
      pct: total > 0 ? Math.round((approved / total) * 100) : 0,
      color: isDark ? "#34d399" : "#006c49",
      badgeClass: "bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7]",
    },
    {
      label: "Menunggu",
      count: pending,
      pct: total > 0 ? Math.round((pending / total) * 100) : 0,
      color: isDark ? "#fbbf24" : "#d97706",
      badgeClass: "bg-[#fef3c7] dark:bg-[#3b2506] text-[#92400e] dark:text-[#fcd34d]",
    },
    {
      label: "Ditolak",
      count: rejected,
      pct: total > 0 ? Math.round((rejected / total) * 100) : 0,
      color: isDark ? "#f87171" : "#dc2626",
      badgeClass: "bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5]",
    },
  ];

  const segmentArcs = segments.reduce<
    {
      label: string;
      color: string;
      dash: number;
      offset: number;
      show: boolean;
    }[]
  >((acc, seg) => {
    const previousTotal = acc.reduce((sum, item) => sum + item.dash, 0);
    const dash = total > 0 ? (seg.count / total) * circumference : 0;
    acc.push({
      label: seg.label,
      color: seg.color,
      dash,
      offset: previousTotal,
      show: seg.count > 0 && total > 0,
    });
    return acc;
  }, []);

  return (
    <section className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 sm:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
              Komposisi Status
            </h3>
            <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
              Rasio keputusan panitia pada periode aktif
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f4f6f8] dark:bg-[#1e2d28] text-[#4b5850] dark:text-[#cbd6d0] shrink-0">
            Periode Ini
          </span>
        </div>

        <div className="my-6 flex items-center justify-center">
          <div className="relative w-[168px] h-[168px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full -rotate-90"
              role="img"
              aria-label={`Komposisi status pendaftar: ${approved} disetujui, ${pending} menunggu, ${rejected} ditolak`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className="stroke-[#eef2f6] dark:stroke-[#24332d]"
                strokeWidth={strokeWidth}
              />
              {segmentArcs.map((arc) => {
                if (!arc.show) return null;
                return (
                  <circle
                    key={arc.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arc.dash} ${circumference}`}
                    strokeDashoffset={-arc.offset}
                    strokeLinecap="butt"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums">
                {formatNumber(total)}
              </span>
              <span className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
                {total > 0 ? "Total Berkas" : "Belum ada data"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f1f5f9] dark:border-[#3c4d46] pt-4">
          <div className="grid grid-cols-12 text-[11px] font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e] pb-2">
            <span className="col-span-6">Status</span>
            <span className="col-span-3 text-right">Jumlah</span>
            <span className="col-span-3 text-right">Porsi</span>
          </div>
          <ul className="divide-y divide-[#f1f5f9] dark:divide-[#24332d]">
            {segments.map((seg) => (
              <li
                key={seg.label}
                className="grid grid-cols-12 items-center py-2.5 text-sm"
              >
                <span className="col-span-6 flex items-center gap-2.5 font-medium text-[#191c1e] dark:text-[#eef2f4]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden="true"
                  />
                  {seg.label}
                </span>
                <span className="col-span-3 text-right font-semibold text-[#191c1e] dark:text-[#eef2f4] tabular-nums">
                  {formatNumber(seg.count)}
                </span>
                <span className="col-span-3 flex justify-end">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${seg.badgeClass}`}
                  >
                    {seg.pct}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {pendingQueue > 0 && (
        <div className="mt-4 pt-3 border-t border-[#f1f5f9] dark:border-[#3c4d46]">
          <Link
            href="/admin/pendaftar?status=PENDING"
            className="min-h-[44px] px-3 py-2 rounded-lg bg-[#fef3c7]/60 dark:bg-[#3b2506] hover:bg-[#fef3c7] dark:hover:bg-[#4e3108] text-[#92400e] dark:text-[#fcd34d] text-xs font-semibold flex items-center justify-between gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] dark:focus-visible:ring-[#fbbf24]"
          >
            <span>
              Tinjau {formatNumber(pendingQueue)} pendaftar menunggu verifikasi
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
