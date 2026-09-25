import React from "react";
import { Dropdown } from "@/components/ui/dropdown";

type Props = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  handleStatusChange: (status: string) => void;
  handleExport: () => void;
};

export default function ApplicantsToolbar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  handleStatusChange,
  handleExport,
}: Props) {
  return (
    <div className="p-4 md:p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface relative z-10">
      <div className="relative w-full sm:w-72 z-10">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/30 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-shadow"
          placeholder="Cari ID, Nama, atau Kontak..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto relative z-20">
        <div className="flex-1 sm:flex-none sm:w-[150px]">
          <Dropdown
            defaultValue={statusFilter}
            options={[
              { label: "Semua Status", value: "all" },
              { label: "Menunggu", value: "pending" },
              { label: "Ditolak", value: "rejected" },
            ]}
            triggerClassName="w-full h-[38px]"
            onChange={handleStatusChange}
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-surface text-on-surface-variant border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors font-label-md text-label-md uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span className="hidden sm:inline">Ekspor Data</span>
        </button>
      </div>
    </div>
  );
}
