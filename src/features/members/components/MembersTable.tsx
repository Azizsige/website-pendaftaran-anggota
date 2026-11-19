"use client";

import React from "react";

import { ActionDropdown } from "./ActionDropdown";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, normalizeIndonesianPhone } from "@/lib/format";
import type { MemberWithUser } from "../types";

interface MembersTableProps {
  members: MemberWithUser[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string) => void;
  isPending: boolean;
  userRole?: string;
  onRefresh: () => void;
  onEdit: (member: MemberWithUser) => void;
  onViewDetail: (member: MemberWithUser) => void;
  onConfirmAction: (
    member: MemberWithUser,
    action: "ACTIVATE" | "SUSPEND" | "INACTIVE"
  ) => void;
  onDelete: (member: MemberWithUser) => void;
  footer?: React.ReactNode;
}

export function MembersTable({
  members,
  selectedIds,
  onSelectAll,
  onSelectOne,
  isPending,
  userRole,
  onRefresh,
  onEdit,
  onViewDetail,
  onConfirmAction,
  onDelete,
  footer,
}: MembersTableProps) {
  const handleSelectionChange = (nextIds: string[]) => {
    if (nextIds.length === 0) {
      onSelectAll(false);
      return;
    }
    if (nextIds.length === members.length && selectedIds.length !== members.length) {
      onSelectAll(true);
      return;
    }
    const added = nextIds.find((id) => !selectedIds.includes(id));
    const removed = selectedIds.find((id) => !nextIds.includes(id));
    if (added) onSelectOne(added);
    else if (removed) onSelectOne(removed);
  };

  const columns: DataTableColumn<MemberWithUser>[] = [
    {
      key: "member",
      header: "Info Anggota",
      headerClassName: "min-w-[220px]",
      cell: (member) => (
        <div className="flex items-center gap-3">
          <MemberAvatar
            src={member.photoUrl}
            name={member.user?.name}
            fallbackInitials="AG"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium text-[#0f172a] dark:text-[#eef2f4]">
              {member.user?.name || "Tanpa Nama"}
            </span>
            <span className="truncate text-xs text-[#64748b] dark:text-[#94a89e]">
              {member.user?.email || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "nim",
      header: "NIM & Kontak",
      headerClassName: "min-w-[170px]",
      cell: (member) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[13px] font-semibold text-[#0f172a] tabular-nums dark:text-[#eef2f4]">
            {member.nim || "-"}
          </span>
          <span className="text-xs text-[#64748b] tabular-nums dark:text-[#94a89e]">
            {normalizeIndonesianPhone(member.phoneNumber) || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "academic",
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
      key: "joinDate",
      header: "Tanggal Bergabung",
      headerClassName: "min-w-[170px]",
      className: "whitespace-nowrap",
      cell: (member) => (
        <span className="text-[13px] text-[#475569] tabular-nums dark:text-[#cbd6d0]">
          {formatDate(member.joinDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-36 min-w-[140px]",
      cell: (member) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={member.status} />
          {member.status === "SUSPENDED" && member.suspendedUntil && (
            <span className="text-[11px] font-medium text-[#9a3412] tabular-nums dark:text-[#fdba74]">
              Hingga {formatDate(member.suspendedUntil)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "w-36 min-w-[120px] text-right",
      className: "text-right",
      cell: (member) => (
        <div className="flex items-center justify-end">
          <ActionDropdown
            member={member}
            onUpdate={onRefresh}
            onEdit={onEdit}
            onViewDetail={onViewDetail}
            onConfirmAction={onConfirmAction}
            onDelete={onDelete}
            userRole={userRole}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={members}
      getRowKey={(m) => m.id}
      isLoading={isPending}
      emptyMessage="Tidak ada anggota yang ditemukan."
      tableClassName="min-w-[1060px]"
      selection={{
        selectedIds,
        onChange: handleSelectionChange,
      }}
      footer={footer}
    />
  );
}
