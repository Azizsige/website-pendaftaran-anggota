"use client";

import Link from "next/link";
import { Building2, CalendarDays, GraduationCap, Settings } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import type { CategoryCountItem } from "../actions";

interface AcademicInsightsRowProps {
  facultyBreakdown: CategoryCountItem[];
  batchBreakdown: CategoryCountItem[];
  registrationMeta: {
    isActive: boolean;
    dateFromIso: string | null;
    dateToIso: string | null;
    maxQuota: number;
    usedQuota: number;
    currentMonthActiveDays: number[];
  };
}

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const MONTH_NAMES_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function buildCurrentMonthCells(): ({
  day: number;
  key: string;
} | null)[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayJs = new Date(year, month, 1).getDay(); // 0=Sun..6=Sat
  const leadingEmpty = (firstDayJs + 6) % 7; // Convert to Mon=0..Sun=6

  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < leadingEmpty; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `${year}-${month + 1}-${d}` });
  }
  return cells;
}

export default function AcademicInsightsRow({
  facultyBreakdown,
  batchBreakdown,
  registrationMeta,
}: AcademicInsightsRowProps) {
  const now = new Date();
  const todayDate = now.getDate();
  const monthLabel = `${MONTH_NAMES_FULL[now.getMonth()]} ${now.getFullYear()}`;
  const calendarCells = buildCurrentMonthCells();
  const activeDaysSet = new Set(registrationMeta.currentMonthActiveDays);

  const hasQuotaLimit = registrationMeta.maxQuota > 0;
  const quotaPct = hasQuotaLimit
    ? Math.min(
        100,
        Math.round(
          (registrationMeta.usedQuota / registrationMeta.maxQuota) * 100
        )
      )
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
      {/* 1. Sebaran Fakultas */}
      <section className="xl:col-span-4 bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
                Sebaran Fakultas
              </h3>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
                Fakultas asal pendaftar terbanyak di periode ini
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#e6f4ee] dark:bg-[#0a3326] text-[#006c49] dark:text-[#34d399] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {facultyBreakdown.length === 0 ? (
            <div className="py-10 text-center rounded-lg border border-dashed border-[#cbd5e1] dark:border-[#5f736b] bg-[#f8fafc] dark:bg-[#1a2723] px-4">
              <p className="text-sm font-medium text-[#4b5850] dark:text-[#cbd6d0]">
                Belum ada data fakultas
              </p>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-1">
                Data akan muncul setelah ada mahasiswa mendaftar pada rentang ini.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {facultyBreakdown.map((item) => (
                <li key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-[#191c1e] dark:text-[#eef2f4] truncate">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-[#4b5850] dark:text-[#cbd6d0] tabular-nums shrink-0">
                      {formatNumber(item.count)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#e6f4ee] dark:bg-[#1e332b] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#006c49] dark:bg-[#34d399]"
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Kalender Aktivitas & Kuota Periode */}
      <section className="xl:col-span-4 bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
                Kalender &amp; Kuota Periode
              </h3>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">{monthLabel}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                registrationMeta.isActive
                  ? "bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7]"
                  : "bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5]"
              }`}
            >
              {registrationMeta.isActive ? "Pendaftaran Dibuka" : "Ditutup"}
            </span>
          </div>

          <div className="rounded-lg bg-[#f8fafc] dark:bg-[#1a2723] border border-[#e2e8f0] dark:border-[#3c4d46] p-3 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-[#4b5850] dark:text-[#cbd6d0]">
                Kuota Terpakai
              </span>
              <span className="font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums">
                {formatNumber(registrationMeta.usedQuota)}
                {hasQuotaLimit
                  ? ` / ${formatNumber(registrationMeta.maxQuota)} (${quotaPct}%)`
                  : " (Tanpa batas)"}
              </span>
            </div>
            {hasQuotaLimit && quotaPct !== null && (
              <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] dark:bg-[#24332d] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#006c49] dark:bg-[#34d399]"
                  style={{ width: `${Math.max(4, quotaPct)}%` }}
                />
              </div>
            )}
            {(registrationMeta.dateFromIso || registrationMeta.dateToIso) && (
              <p className="text-[11px] text-[#52606d] dark:text-[#94a89e] mt-2 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Jadwal:{" "}
                  {registrationMeta.dateFromIso
                    ? formatDate(registrationMeta.dateFromIso, "d MMM yyyy")
                    : "Sekarang"}{" "}
                  s.d.{" "}
                  {registrationMeta.dateToIso
                    ? formatDate(registrationMeta.dateToIso, "d MMM yyyy")
                    : "Selesai"}
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#52606d] dark:text-[#94a89e] mb-1.5">
            {DAY_HEADERS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-8" />;
              }
              const isToday = cell.day === todayDate;
              const hasActivity = activeDaysSet.has(cell.day);
              return (
                <div
                  key={cell.key}
                  title={
                    isToday
                      ? "Hari ini"
                      : hasActivity
                        ? `Ada pendaftaran pada ${cell.day} ${monthLabel}`
                        : `${cell.day} ${monthLabel}`
                  }
                  className={`h-8 rounded-lg flex flex-col items-center justify-center relative tabular-nums ${
                    isToday
                      ? "bg-[#006c49] dark:bg-[#057a55] text-white font-bold"
                      : hasActivity
                        ? "bg-[#e6f4ee] dark:bg-[#0c3528] text-[#005236] dark:text-[#6ee7b7] font-semibold"
                        : "text-[#4b5850] dark:text-[#cbd6d0]"
                  }`}
                >
                  <span>{cell.day}</span>
                  {hasActivity && !isToday && (
                    <span
                      className="w-1 h-1 rounded-full bg-[#006c49] dark:bg-[#34d399] absolute bottom-1"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#f1f5f9] dark:border-[#3c4d46] flex items-center justify-between text-xs text-[#52606d] dark:text-[#94a89e]">
          <span>Penanda hijau: hari dengan pendaftar masuk</span>
          <Link
            href="/admin/settings?tab=registration_settings"
            className="inline-flex items-center gap-1 font-semibold text-[#006c49] dark:text-[#34d399] hover:text-[#005236] dark:hover:text-[#6ee7b7] py-1"
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Atur</span>
          </Link>
        </div>
      </section>

      {/* 3. Distribusi Angkatan */}
      <section className="md:col-span-2 xl:col-span-4 bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
                Distribusi Angkatan
              </h3>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
                Komposisi tahun masuk pendaftar di periode aktif
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#eff6ff] dark:bg-[#132544] text-[#1e40af] dark:text-[#93c5fd] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {batchBreakdown.length === 0 ? (
            <div className="py-10 text-center rounded-lg border border-dashed border-[#cbd5e1] dark:border-[#5f736b] bg-[#f8fafc] dark:bg-[#1a2723] px-4">
              <p className="text-sm font-medium text-[#4b5850] dark:text-[#cbd6d0]">
                Belum ada data angkatan
              </p>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-1">
                Ringkasan angkatan mahasiswa tampil saat data pendaftar tersedia.
              </p>
            </div>
          ) : (
            <ul className="space-y-3.5">
              {batchBreakdown.map((item) => (
                <li
                  key={item.label}
                  className="p-3 rounded-lg border border-[#f1f5f9] dark:border-[#3c4d46] bg-[#f8fafc] dark:bg-[#1a2723] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#191c1e] dark:text-[#eef2f4]">
                      {item.label === "Lainnya"
                        ? "Tahun Belum Diisi"
                        : `Angkatan ${item.label}`}
                    </p>
                    <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5 tabular-nums">
                      {formatNumber(item.count)} pendaftar terdaftar
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#eff6ff] dark:bg-[#132544] text-[#1e40af] dark:text-[#93c5fd] tabular-nums shrink-0">
                    {item.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
