"use client";

import React from "react";
import { TableToolbar } from "@/components/ui/table-toolbar";

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
    <TableToolbar
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Cari ID, Nama, atau Kontak..."
      filter={{
        value: statusFilter,
        options: [
          { label: "Semua Status", value: "all" },
          { label: "Menunggu", value: "pending" },
          { label: "Ditolak", value: "rejected" },
        ],
        onChange: handleStatusChange,
      }}
      actions={
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-surface text-on-surface-variant border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors font-label-md text-label-md uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span className="hidden sm:inline">Ekspor Data</span>
        </button>
      }
    />
  );
}
