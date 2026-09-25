import React from "react";

interface ReportSummaryCardsProps {
  loading: boolean;
  summary: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export function ReportSummaryCards({ loading, summary }: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">group</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">Total Pendaftar (Tersaring)</span>
        <span className="font-display-sm text-[32px] font-bold text-on-surface">{loading ? "..." : summary.total}</span>
      </div>
      <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 text-primary">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">Disetujui / Aktif</span>
        <span className="font-display-sm text-[32px] font-bold text-primary">{loading ? "..." : summary.approved}</span>
      </div>
      <div className="bg-secondary/5 rounded-xl border border-secondary/20 p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 text-secondary">
          <span className="material-symbols-outlined text-5xl">pending</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">Menunggu</span>
        <span className="font-display-sm text-[32px] font-bold text-secondary">{loading ? "..." : summary.pending}</span>
      </div>
      <div className="bg-error/5 rounded-xl border border-error/20 p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 text-error">
          <span className="material-symbols-outlined text-5xl">cancel</span>
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant">Ditolak / Dibekukan</span>
        <span className="font-display-sm text-[32px] font-bold text-error">{loading ? "..." : summary.rejected}</span>
      </div>
    </div>
  );
}
