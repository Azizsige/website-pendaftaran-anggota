"use client";

import React from "react";

import type { MemberWithUser } from "@/types/member";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { LoadingWaveDots } from "@/components/ui/loading-wave-dots";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";

interface ReportTableProps {
  loading: boolean;
  members: MemberWithUser[];
  page: number;
  totalCount: number;
  totalPages: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

const columns: DataTableColumn<MemberWithUser>[] = [
  {
    key: "joinDate",
    header: "Tanggal Mendaftar",
    headerClassName: "min-w-[170px]",
    className: "whitespace-nowrap",
    cell: (member) => (
      <span className="text-[13px] text-[#475569] tabular-nums dark:text-[#cbd6d0]">
        {formatDate(member.joinDate)}
      </span>
    ),
  },
  {
    key: "nim",
    header: "NIM",
    headerClassName: "w-40 min-w-[140px]",
    cell: (member) => (
      <span className="font-mono text-[13px] font-semibold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
        {member.nim || "-"}
      </span>
    ),
  },
  {
    key: "name",
    header: "Nama Lengkap",
    headerClassName: "min-w-[210px]",
    cell: (member) => (
      <div className="flex items-center gap-3">
        <MemberAvatar
          src={member.photoUrl}
          name={member.user?.name}
          fallbackInitials="AG"
        />
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {member.user?.name || "Tanpa Nama"}
          </span>
          <span className="text-xs text-[#64748b] dark:text-[#94a89e]">
            {member.user?.email || "-"}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "facultyMajor",
    header: "Fakultas & Program Studi",
    headerClassName: "min-w-[220px]",
    cell: (member) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-[#0f172a] dark:text-[#eef2f4]">
          {member.faculty || "-"}
        </span>
        <span className="text-xs text-[#64748b] dark:text-[#94a89e]">{member.major || "-"}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    headerClassName: "w-36 min-w-[140px]",
    cell: (member) => <StatusBadge status={member.status} />,
  },
  {
    key: "notes",
    header: "Keterangan",
    headerClassName: "min-w-[160px]",
    cell: (member) => (
      <span className="line-clamp-2 text-[13px] text-[#475569] dark:text-[#cbd6d0]">
        {member.adminNotes || "-"}
      </span>
    ),
  },
];

export function ReportTable({
  loading,
  members,
  page,
  totalCount,
  totalPages,
  limit,
  onPageChange,
}: ReportTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f1f5f9] bg-white px-5 py-4 sm:px-6 dark:border-[#24332d] dark:bg-[#131d1a]">
        <div>
          <h2 className="text-base font-semibold text-[#0f172a] dark:text-[#eef2f4]">
            Rincian Data Anggota
          </h2>
          <p className="text-xs text-[#64748b] dark:text-[#94a89e]">
            Hasil penyaringan data keanggotaan sesuai rentang tanggal dan status terpilih.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#334155] tabular-nums dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
          {loading ? (
            <>
              <span>Memuat</span>
              <LoadingWaveDots size="sm" label="Memuat rincian data" />
            </>
          ) : (
            `${totalCount.toLocaleString("id-ID")} data`
          )}
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={members}
        getRowKey={(m) => m.id}
        isLoading={loading}
        emptyMessage="Tidak ada data yang cocok dengan filter yang dipilih."
        tableClassName="min-w-[1040px]"
        footer={
          !loading && totalCount > 0 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={limit}
              onPageChange={onPageChange}
            />
          ) : null
        }
      />
    </div>
  );
}
