"use client";

import React, { useEffect, useCallback } from 'react';

import { startOfDay, endOfDay } from "date-fns";
import { getReportMembers } from "@/actions/admin-reports";
import { useReportExport } from "./hooks/useReportExport";
import DashboardFilter from "../_components/DashboardFilter";
import { ReportSummaryCards } from "./_components/ReportSummaryCards";
import { ReportTable } from "./_components/ReportTable";
import { useReportStore } from "@/store/useReportStore";

export default function ReportsPage() {
  const {
    date, status, faculty, page, loading, members, totalPages, totalCount, summary,
    setDate, setStatus, setFaculty, setPage, setLoading, setMembers, setTotalPages, setTotalCount, setSummary
  } = useReportStore();

  const limit = 10;
  
  const { handleExport, handlePrint } = useReportExport({ date, status, faculty });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      let dateFrom = date?.from ? startOfDay(date.from) : undefined;
      let dateTo = date?.to ? endOfDay(date.to) : dateFrom ? endOfDay(dateFrom) : undefined;

      const res = await getReportMembers(status, faculty, dateFrom, dateTo, page, limit);
      
      setMembers(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      setSummary(res.summary);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, [status, faculty, date, page, setMembers, setTotalPages, setTotalCount, setSummary, setLoading]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-surface-container-lowest min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h2 className="font-display-sm text-[36px] font-bold text-on-surface tracking-tight">Laporan Data Anggota</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Hasilkan dan unduh data keanggotaan terperinci.</p>
        </div>

        <div className="bg-surface rounded-xl border border-outline-variant/20 p-4 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center shadow-sm">
          <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
            <div className="relative">
              <DashboardFilter date={date} onDateChange={(d) => setDate(d)} />
            </div>
            
            <div className="w-full sm:w-[150px]">
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Semua Status</option>
                <option value="ACTIVE">Aktif/Disetujui</option>
                <option value="PENDING">Menunggu</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>

            <div className="w-full sm:w-[200px]">
              <select 
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-surface border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all_faculty">Semua Fakultas</option>
                <option value="teknik">Fakultas Teknik</option>
                <option value="ekonomi">Fakultas Ekonomi</option>
                <option value="hukum">Fakultas Hukum</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Ekspor Data
            </button>
            <button 
              onClick={handlePrint}
              className="p-2.5 border border-outline-variant/50 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors shadow-sm cursor-pointer" 
              title="Print"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        </div>

        <ReportSummaryCards loading={loading} summary={summary} />

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
