"use client";

import React, { useCallback, useEffect } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { Download, Printer } from "lucide-react";
import { useSession } from "next-auth/react";

import { getReportMembers } from "../actions";
import { logger } from "@/lib/logger";
import { useReportExport } from "../hooks/useReportExport";
import { Dropdown } from "@/components/ui/dropdown";
import DashboardFilter from "@/features/dashboard/components/DashboardFilter";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportTable } from "./ReportTable";
import { useReportStore } from "../store";

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif / Disetujui", value: "ACTIVE" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Ditolak", value: "REJECTED" },
];

const FACULTY_OPTIONS = [
  { label: "Semua Fakultas", value: "all_faculty" },
  { label: "Fakultas Teknik", value: "teknik" },
  { label: "Fakultas Ekonomi", value: "ekonomi" },
  { label: "Fakultas Hukum", value: "hukum" },
];

export function ReportsClient() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const {
    date,
    status,
    faculty,
    page,
    loading,
    members,
    totalPages,
    totalCount,
    summary,
    setDate,
    setStatus,
    setFaculty,
    setPage,
    setLoading,
    setMembers,
    setTotalPages,
    setTotalCount,
    setSummary,
  } = useReportStore();

  const limit = 10;

  const { handleExport, handlePrint } = useReportExport({ date, status, faculty });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const dateFrom = date?.from ? startOfDay(date.from) : undefined;
      const dateTo = date?.to
        ? endOfDay(date.to)
        : dateFrom
        ? endOfDay(dateFrom)
        : undefined;

      const res = await getReportMembers(status, faculty, dateFrom, dateTo, page, limit);

      setMembers(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      setSummary(res.summary);
    } catch (error) {
      logger.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    faculty,
    date,
    page,
    setMembers,
    setTotalPages,
    setTotalCount,
    setSummary,
    setLoading,
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="min-h-screen flex-1 bg-[#f4f6f8] p-4 sm:p-6 lg:p-8 dark:bg-[#0d1412]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl dark:text-[#eef2f4]">
              Laporan Data Anggota
            </h1>
            <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
              Saring statistik pendaftaran menurut periode, status verifikasi, atau fakultas lalu unduh laporannya.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-[#e2e8f0] bg-white p-4 sm:p-5 lg:flex-row lg:items-center dark:border-[#3c4d46] dark:bg-[#131d1a]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <DashboardFilter date={date} onDateChange={(d) => setDate(d)} />
            </div>

            <div className="w-full sm:w-[190px]">
              <Dropdown
                value={status}
                options={STATUS_OPTIONS}
                onChange={setStatus}
                placeholder="Pilih Status"
              />
            </div>

            <div className="w-full sm:w-[210px]">
              <Dropdown
                value={faculty}
                options={FACULTY_OPTIONS}
                onChange={setFaculty}
                placeholder="Pilih Fakultas"
              />
            </div>
          </div>

          {userRole !== "STAFF" && (
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a]"
              >
                <Download className="h-4 w-4" aria-hidden />
                <span>Ekspor Data</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                aria-label="Cetak laporan"
                title="Cetak laporan"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#85929f] bg-white text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
              >
                <Printer className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>

        <ReportSummaryCards summary={summary} loading={loading} />

        <ReportTable
          loading={loading}
          members={members}
          page={page}
          totalCount={totalCount}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
