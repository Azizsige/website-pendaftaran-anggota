"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { useAdminStore, Admin } from "@/store/useAdminStore";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  SUPER_ADMIN: "Super Admin",
  COORDINATOR: "Koordinator",
  STAFF: "Staff",
};

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "AD";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const AdminTable = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const {
    admins,
    setSelectedAdmin,
    setIsEditAdminOpen,
    setAdminToDelete,
    setIsDeleteModalOpen,
  } = useAdminStore();

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsEditAdminOpen(true);
  };

  const confirmDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const visibleAdmins = admins.filter(
    (admin) => admin.role !== "OWNER" || userRole === "OWNER"
  );

  const columns: DataTableColumn<Admin>[] = [
    {
      key: "name",
      header: "Nama Lengkap",
      cell: (admin) => (
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#006c49]/15 bg-[#e6f4ee] text-xs font-semibold text-[#005236] dark:border-[#34d399]/35 dark:bg-[#0a3326] dark:text-[#6ee7b7]"
          >
            {getInitials(admin.name)}
          </div>
          <span className="font-medium text-[#0f172a] dark:text-[#eef2f4]">{admin.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Alamat Email",
      className: "break-all text-sm text-[#475569] sm:break-normal dark:text-[#cbd6d0]",
      cell: (admin) => admin.email,
    },
    {
      key: "role",
      header: "Peran",
      cell: (admin) => (
        <span className="inline-flex items-center rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1 text-xs font-semibold text-[#334155] dark:border-[#3c4d46] dark:bg-[#1a2723] dark:text-[#cbd6d0]">
          {ROLE_LABELS[admin.role] || admin.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-36",
      cell: (admin) => (
        <StatusBadge status={admin.status || "INACTIVE"} />
      ),
    },
    {
      key: "actions",
      header: <span className="block text-right">Aksi</span>,
      headerClassName: "w-36 text-right",
      className: "text-right",
      cell: (admin) => {
        const canEdit =
          !(userRole === "SUPER_ADMIN" && admin.role === "OWNER") &&
          !(
            userRole === "SUPER_ADMIN" &&
            admin.role === "SUPER_ADMIN" &&
            admin.id !== session?.user?.id
          );

        const canDelete =
          !(
            userRole === "SUPER_ADMIN" &&
            (admin.role === "SUPER_ADMIN" || admin.role === "OWNER")
          ) &&
          admin.role !== "OWNER" &&
          admin.id !== session?.user?.id;

        return (
          <div className="flex justify-end gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => handleEditAdmin(admin)}
                aria-label={`Edit admin ${admin.name}`}
                title="Edit Admin"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#e6f4ee] text-[#005236] transition-colors hover:bg-[#cde9dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] dark:bg-[#0a3326] dark:text-[#6ee7b7] dark:hover:bg-[#114d3a] dark:focus-visible:ring-[#34d399]"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => confirmDeleteAdmin(admin)}
                aria-label={`Hapus admin ${admin.name}`}
                title="Hapus Admin"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#fef2f2] text-[#991b1b] transition-colors hover:bg-[#fee2e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] dark:bg-[#3b1214] dark:text-[#fca5a5] dark:hover:bg-[#531a1d] dark:focus-visible:ring-[#f87171]"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-[#e2e8f0] dark:border-[#3c4d46]">
      <DataTable
        columns={columns}
        rows={visibleAdmins}
        getRowKey={(admin) => admin.id}
        emptyMessage="Belum ada data administrator."
        tableClassName="w-full min-w-[720px]"
      />
    </div>
  );
};
