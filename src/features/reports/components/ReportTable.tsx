"use client";

import React from "react";
import type { MemberWithUser } from "@/types/member";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
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
    cell: (member) => formatDate(member.joinDate),
    className: "font-body-sm text-body-sm text-on-surface",
  },
  {
    key: "nim",
    header: "NIM",
    cell: (member) => member.nim || "-",
    className: "font-body-sm text-on-surface-variant",
  },
  {
    key: "name",
    header: "Nama Lengkap",
    cell: (member) => member.user?.name || "-",
    className: "font-body-sm text-body-sm font-medium text-on-surface",
  },
  {
    key: "facultyMajor",
    header: "Fakultas / Jurusan",
    cell: (member) => (
      <div className="font-body-sm text-body-sm text-on-surface-variant">
        <span>{member.faculty || "-"}</span>
        <br />
        <span className="text-xs">{member.major || "-"}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (member) => <StatusBadge status={member.status} />,
  },
  {
    key: "notes",
    header: "Keterangan",
    cell: (member) => member.adminNotes || "-",
    className: "font-body-sm text-body-sm text-on-surface-variant",
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
    <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm">
      <DataTable
        columns={columns}
        rows={members}
        getRowKey={(m) => m.id}
        isLoading={loading}
        emptyMessage="Tidak ada data yang cocok dengan filter."
        tableClassName="min-w-[900px]"
        footer={
          !loading && members.length > 0 ? (
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
