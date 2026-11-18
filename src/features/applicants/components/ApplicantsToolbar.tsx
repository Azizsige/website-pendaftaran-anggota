"use client";

import React from "react";
import { Download } from "lucide-react";

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
      title="Daftar Calon Anggota"
      description="Cari berdasarkan NIM, ID registrasi, nama lengkap, atau email pendaftar."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Cari NIM, Nama, atau Email..."
      filter={{
        value: statusFilter,
        options: [
          { label: "Semua Status", value: "all" },
          { label: "Menunggu Verifikasi", value: "pending" },
          { label: "Ditolak", value: "rejected" },
        ],
        onChange: handleStatusChange,
      }}
      actions={
        <button
          type="button"
          onClick={handleExport}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#85929f] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:border-[#5f736b] dark:bg-[#1a2723] dark:text-[#eef2f4] dark:hover:bg-[#22322d] dark:focus-visible:ring-[#34d399]"
        >
          <Download className="h-4 w-4 text-[#475569] dark:text-[#94a89e]" aria-hidden />
          <span>Ekspor Data</span>
        </button>
      }
    />
  );
}
