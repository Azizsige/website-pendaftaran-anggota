import React from "react";
import { Ban, Eye, Trash2 } from "lucide-react";

import type { Applicant } from "../types";
import { formatId } from "../utils";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/format";

type Props = {
  applicants: Applicant[];
  isPending: boolean;
  onViewDetail: (applicant: Applicant) => void;
  onDelete: (applicant: Applicant) => void;
  onSuspend: (applicant: Applicant) => void;
  userRole?: string;
  footer?: React.ReactNode;
};

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "CA";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ApplicantsTable({
  applicants,
  isPending,
  onViewDetail,
  onDelete,
  onSuspend,
  userRole,
  footer,
}: Props) {
  const columns: DataTableColumn<Applicant>[] = [
    {
      key: "nim",
      header: "NIM & Registrasi",
      headerClassName: "min-w-[165px]",
      className: "whitespace-nowrap",
      cell: (applicant) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[13px] font-semibold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
            {applicant.nim || "Belum diisi"}
          </span>
          <span className="font-mono text-[11px] text-[#64748b] dark:text-[#94a89e]">
            {formatId(applicant.id)}
          </span>
        </div>
      ),
    },
    {
      key: "name",
      header: "Nama Lengkap",
      headerClassName: "min-w-[205px]",
      cell: (applicant) => (
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#006c49]/15 bg-[#e6f4ee] text-xs font-semibold text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
          >
            {getInitials(applicant.user.name)}
          </div>
          <span className="font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.user.name || "Tanpa Nama"}
          </span>
        </div>
      ),
    },
    {
      key: "academic",
      header: "Fakultas & Program Studi",
      headerClassName: "min-w-[220px]",
      cell: (applicant) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.faculty || "-"}
          </span>
          <span className="text-xs text-[#64748b] dark:text-[#94a89e]">{applicant.major || "-"}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Kontak",
      headerClassName: "min-w-[190px]",
      cell: (applicant) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-[#0f172a] dark:text-[#eef2f4]">
            {applicant.user.email || "-"}
          </span>
          <span className="text-xs text-[#64748b] tabular-nums dark:text-[#94a89e]">
            {applicant.phoneNumber || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "joinDate",
      header: "Tanggal Daftar",
      headerClassName: "min-w-[160px]",
      className: "whitespace-nowrap",
      cell: (applicant) => (
        <span className="text-[13px] text-[#475569] tabular-nums dark:text-[#cbd6d0]">
          {formatDateTime(applicant.joinDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-36 min-w-[140px]",
      cell: (applicant) => <StatusBadge status={applicant.status} />,
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "w-44 min-w-[160px] text-right",
      className: "text-right",
      cell: (applicant) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onViewDetail(applicant)}
            aria-label={`Lihat detail ${applicant.user.name || "calon anggota"}`}
            title="Lihat Detail"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#e6f4ee] text-[#005236] transition-colors hover:bg-[#cde9dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:hover:bg-[#114d3a] dark:focus-visible:ring-[#34d399]"
          >
            <Eye className="h-4 w-4" aria-hidden />
          </button>

          {applicant.status === "ACTIVE" && userRole !== "STAFF" && (
            <button
              type="button"
              onClick={() => onSuspend(applicant)}
              disabled={isPending}
              aria-label={`Bekukan ${applicant.user.name || "calon anggota"}`}
              title="Bekukan Status"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#fef3c7] text-[#92400e] transition-colors hover:bg-[#fde68a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3b2506] dark:text-[#fcd34d] dark:hover:bg-[#52340a] dark:focus-visible:ring-[#f59e0b]"
            >
              <Ban className="h-4 w-4" aria-hidden />
            </button>
          )}

          {(userRole === "OWNER" || userRole === "SUPER_ADMIN") && (
            <button
              type="button"
              onClick={() => onDelete(applicant)}
              disabled={isPending}
              aria-label={`Hapus permanen ${applicant.user.name || "calon anggota"}`}
              title="Hapus Data"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#fef2f2] text-[#991b1b] transition-colors hover:bg-[#fee2e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3b1214] dark:text-[#fca5a5] dark:hover:bg-[#531a1d] dark:focus-visible:ring-[#f87171]"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={applicants}
      getRowKey={(row) => row.id}
      isLoading={isPending}
      emptyMessage="Tidak ada data calon anggota yang sesuai."
      tableClassName="min-w-[1140px]"
      footer={footer}
    />
  );
}
