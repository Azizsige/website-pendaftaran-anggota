"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { formatDate, formatNumber } from "@/lib/format";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getDashboardData, type DashboardData } from "../actions";
import DashboardFilter from "./DashboardFilter";
import ChartFilter from "./ChartFilter";
import NewMemberButton from "./NewMemberButton";

const RegistrationChart = dynamic(() => import("./RegistrationChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] sm:h-[300px] w-full animate-pulse rounded-lg bg-[#f1f5f9] dark:bg-[#1a2723]" />
  ),
});
import {
  AreaSparklineMiniChart,
  ColumnBarsMiniChart,
  DualSparklineMiniChart,
  TrackBarsMiniChart,
} from "./MiniKpiCharts";
import StatusCompositionCard from "./StatusCompositionCard";
import AcademicInsightsRow from "./AcademicInsightsRow";
import RecentApplicantsCard from "./RecentApplicantsCard";

interface DashboardClientProps {
  initialData: DashboardData;
  initialChartRange?: string;
  adminName: string;
}

function renderDeltaPill(current: number, previous: number) {
  const diff = current - previous;
  if (previous === 0 && current === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0] shrink-0">
        Belum ada data
      </span>
    );
  }
  if (previous === 0 && current > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] shrink-0">
        <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
        <span>+{formatNumber(current)} baru</span>
      </span>
    );
  }
  const pct = Math.round((diff / previous) * 100);
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] shrink-0">
        <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
        <span>+{pct}%</span>
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#fef2f2] dark:bg-[#3b1214] text-[#991b1b] dark:text-[#fca5a5] shrink-0">
        <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{pct}%</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0] shrink-0">
      Stabil (0%)
    </span>
  );
}

export default function DashboardClient({
  initialData,
  initialChartRange = "6_months",
  adminName,
}: DashboardClientProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [prevInitialData, setPrevInitialData] =
    useState<DashboardData>(initialData);
  const [data, setData] = useState<DashboardData>(initialData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
    from: new Date(initialData.appliedRange.fromIso),
    to: new Date(initialData.appliedRange.toIso),
  }));
  const [chartRange, setChartRange] = useState<string>(initialChartRange);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setData(initialData);
  }

  const syncUrlParams = (
    nextRange: DateRange | undefined,
    nextChartRange: string
  ) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (nextRange?.from) params.set("from", nextRange.from.toISOString());
    if (nextRange?.to) params.set("to", nextRange.to.toISOString());
    if (nextChartRange !== "6_months") {
      params.set("chart_range", nextChartRange);
    }
    const query = params.toString();
    const target = query ? `/admin?${query}` : "/admin";
    window.history.replaceState(null, "", target);
  };

  const loadDashboard = (
    nextRange: DateRange | undefined,
    nextChartRange: string
  ) => {
    syncUrlParams(nextRange, nextChartRange);
    startTransition(async () => {
      try {
        setFetchError(null);
        const fresh = await getDashboardData({
          from: nextRange?.from ? nextRange.from.toISOString() : undefined,
          to: nextRange?.to ? nextRange.to.toISOString() : undefined,
          chartRange: nextChartRange,
        });
        setData(fresh);
      } catch (err) {
        setFetchError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat menyegarkan data statistik."
        );
      }
    });
  };

  const handleDateChange = (nextDate: DateRange | undefined) => {
    setDateRange(nextDate);
    if (!nextDate) {
      const now = new Date();
      const fallbackTo = new Date(now);
      const fallbackFrom = new Date(now);
      fallbackFrom.setDate(fallbackFrom.getDate() - 29);
      const defaultRange = { from: fallbackFrom, to: fallbackTo };
      setDateRange(defaultRange);
      loadDashboard(defaultRange, chartRange);
      return;
    }
    loadDashboard(nextDate, chartRange);
  };

  const handleChartRangeChange = (nextChartRange: string) => {
    setChartRange(nextChartRange);
    loadDashboard(dateRange, nextChartRange);
  };

  const handleResetFilter = () => {
    const now = new Date();
    const fallbackTo = new Date(now);
    const fallbackFrom = new Date(now);
    fallbackFrom.setDate(fallbackFrom.getDate() - 29);
    const defaultRange = { from: fallbackFrom, to: fallbackTo };
    setDateRange(defaultRange);
    loadDashboard(defaultRange, chartRange);
  };

  const handleRetry = () => {
    loadDashboard(dateRange, chartRange);
  };

  const { stats, miniTrends, chart, statusBreakdown } = data;
  const activePeriodLabel =
    dateRange?.from && dateRange?.to
      ? `${formatDate(dateRange.from, "d MMM yyyy")} - ${formatDate(dateRange.to, "d MMM yyyy")}`
      : dateRange?.from
        ? formatDate(dateRange.from, "d MMM yyyy")
        : "30 hari terakhir";

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Greeting & Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0 flex-1 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-[#191c1e] dark:text-[#eef2f4] tracking-tight">
            Halo, {adminName}
          </h1>
          <p className="text-sm text-[#52606d] dark:text-[#cbd6d0] mt-1">
            Ringkasan statistik pendaftaran, antrean verifikasi, dan sebaran
            anggota untuk periode {activePeriodLabel}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 shrink-0">
          <DashboardFilter date={dateRange} onDateChange={handleDateChange} />
          <NewMemberButton />
        </div>
      </div>

      {/* Explicit Error Alert Banner */}
      {fetchError && (
        <div
          role="alert"
          className="rounded-xl border border-[#fecaca] dark:border-[#f87171]/40 bg-[#fef2f2] dark:bg-[#3b1214] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <p className="text-sm font-semibold text-[#991b1b] dark:text-[#fca5a5]">
              Gagal memperbarui ringkasan admin
            </p>
            <p className="text-xs text-[#991b1b]/90 dark:text-[#fecaca] mt-0.5">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#991b1b] hover:bg-[#7f1d1d] dark:bg-[#dc2626] dark:hover:bg-[#b91c1c] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Muat Ulang</span>
          </button>
        </div>
      )}

      {/* 4 KPI Cards Row */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 transition-opacity duration-150 ${
          isPending ? "opacity-70" : "opacity-100"
        }`}
      >
        {/* Card 1: Total Anggota Aktif (Track Bars) */}
        <article className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Anggota Aktif
              </p>
              <p className="text-2xl sm:text-[28px] font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums mt-1.5 leading-tight">
                {formatNumber(stats.totalActiveMembers)}
              </p>
            </div>
            {stats.approvedInRange > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] shrink-0">
                +{formatNumber(stats.approvedInRange)} periode ini
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] dark:bg-[#1e2d28] text-[#475569] dark:text-[#cbd6d0] shrink-0">
                Total terdaftar
              </span>
            )}
          </div>
          <TrackBarsMiniChart
            values={miniTrends.approved}
            labels={miniTrends.labels}
            ariaLabel="Tren persetujuan anggota 7 hari terakhir"
            accentColor={isDark ? "#34d399" : "#006c49"}
            trackColor={isDark ? "#1e332b" : "#e6f4ee"}
          />
          <p className="text-[11px] text-[#52606d] dark:text-[#94a89e]">
            Persetujuan harian 7 hari terakhir
          </p>
        </article>

        {/* Card 2: Antrean Verifikasi (Dual Sparkline) */}
        <article className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Antrean Verifikasi
              </p>
              <p className="text-2xl sm:text-[28px] font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums mt-1.5 leading-tight">
                {formatNumber(stats.pendingQueue)}
              </p>
            </div>
            {stats.pendingQueue > 0 ? (
              <Link
                href="/admin/pendaftar?status=PENDING"
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] dark:bg-[#3b2506] text-[#92400e] dark:text-[#fcd34d] hover:bg-[#fde68a] dark:hover:bg-[#4e3108] transition-colors shrink-0"
              >
                {formatNumber(stats.pendingInRange)} baru
              </Link>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f4ee] dark:bg-[#0a3326] text-[#005236] dark:text-[#6ee7b7] shrink-0">
                Antrean bersih
              </span>
            )}
          </div>
          <DualSparklineMiniChart
            primaryValues={miniTrends.submitted}
            secondaryValues={miniTrends.pending}
            ariaLabel="Perbandingan pendaftar masuk dan berkas menunggu 7 hari terakhir"
          />
          <p className="text-[11px] text-[#52606d] dark:text-[#94a89e]">
            Masuk (hijau) vs menunggu (kuning) 7 hari
          </p>
        </article>

        {/* Card 3: Disetujui di Periode Ini (Column Bars) */}
        <article className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Disetujui (Periode)
              </p>
              <p className="text-2xl sm:text-[28px] font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums mt-1.5 leading-tight">
                {formatNumber(stats.approvedInRange)}
              </p>
            </div>
            {renderDeltaPill(stats.approvedInRange, stats.prevApprovedInRange)}
          </div>
          <ColumnBarsMiniChart
            values={miniTrends.approved}
            labels={miniTrends.labels}
            ariaLabel="Kolom jumlah anggota disetujui 7 hari terakhir"
          />
          <p className="text-[11px] text-[#52606d] dark:text-[#94a89e]">
            Dibanding rentang waktu sebelumnya
          </p>
        </article>

        {/* Card 4: Total Pendaftar Masuk di Periode Ini (Area Sparkline) */}
        <article className="bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#52606d] dark:text-[#94a89e]">
                Pendaftar Masuk
              </p>
              <p className="text-2xl sm:text-[28px] font-bold text-[#191c1e] dark:text-[#eef2f4] tabular-nums mt-1.5 leading-tight">
                {formatNumber(stats.totalInRange)}
              </p>
            </div>
            {renderDeltaPill(stats.totalInRange, stats.prevTotalInRange)}
          </div>
          <AreaSparklineMiniChart
            values={miniTrends.submitted}
            ariaLabel="Kurva tren pendaftar masuk 7 hari terakhir"
          />
          <p className="text-[11px] text-[#52606d] dark:text-[#94a89e]">
            Pengajuan formulir 7 hari terakhir
          </p>
        </article>
      </div>

      {/* Main Chart (8 Cols) & Status Composition Donut (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <section className="xl:col-span-8 bg-white dark:bg-[#131d1a] rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#191c1e] dark:text-[#eef2f4]">
                Tren Pendaftaran Masuk
              </h2>
              <p className="text-xs text-[#52606d] dark:text-[#94a89e] mt-0.5">
                Tercatat {formatNumber(chart.totalInSeries)} pengajuan anggota
                pada rentang grafik yang dipilih
              </p>
            </div>
            <ChartFilter value={chartRange} onChange={handleChartRangeChange} />
          </div>

          <RegistrationChart labels={chart.labels} data={chart.data} />
        </section>

        <div className="xl:col-span-4">
          <StatusCompositionCard
            approved={statusBreakdown.approved}
            pending={statusBreakdown.pending}
            rejected={statusBreakdown.rejected}
            total={statusBreakdown.total}
            pendingQueue={stats.pendingQueue}
          />
        </div>
      </div>

      {/* Fakultas, Kalender/Kuota, & Distribusi Angkatan */}
      <AcademicInsightsRow
        facultyBreakdown={data.facultyBreakdown}
        batchBreakdown={data.batchBreakdown}
        registrationMeta={data.registrationMeta}
      />

      {/* Tabel Pendaftar Terbaru */}
      <RecentApplicantsCard
        applicants={data.recentApplicants}
        isLoading={isPending}
        errorMessage={fetchError}
        onRetry={handleRetry}
        onResetFilter={handleResetFilter}
      />

      {/* Strip Footer Internal Admin */}
      <footer className="pt-2 pb-4 border-t border-[#e2e8f0] dark:border-[#3c4d46] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#52606d] dark:text-[#94a89e]">
        <p>
          Panel Panitia Pendaftaran Anggota - Data statistik dibaca langsung
          dari sistem.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/admin/pendaftar"
            className="hover:text-[#006c49] dark:hover:text-[#34d399] font-medium py-1"
          >
            Calon Anggota
          </Link>
          <Link
            href="/admin/members"
            className="hover:text-[#006c49] dark:hover:text-[#34d399] font-medium py-1"
          >
            Anggota Aktif
          </Link>
          <Link
            href="/admin/reports"
            className="hover:text-[#006c49] dark:hover:text-[#34d399] font-medium py-1"
          >
            Laporan Data
          </Link>
        </div>
      </footer>
    </div>
  );
}
