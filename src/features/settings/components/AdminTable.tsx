"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useAdminStore, Admin } from "@/store/useAdminStore";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

export const AdminTable = () => {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const { admins, setSelectedAdmin, setIsEditAdminOpen, setAdminToDelete, setIsDeleteModalOpen } =
    useAdminStore();

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
      header: "Name",
      headerClassName: "font-semibold",
      cell: (admin) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0">
            {admin.name ? admin.name.substring(0, 2).toUpperCase() : "NA"}
          </div>
          <span className="font-medium text-sm text-on-surface">{admin.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email Address",
      headerClassName: "font-semibold",
      className: "text-sm text-on-surface-variant break-all sm:break-normal",
      cell: (admin) => admin.email,
    },
    {
      key: "role",
      header: "Role",
      headerClassName: "font-semibold",
      className: "text-sm text-on-surface-variant",
      cell: (admin) => admin.role,
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "font-semibold",
      cell: (admin) => (
        <StatusBadge status={admin.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      key: "actions",
      header: <span className="block text-right">Actions</span>,
      headerClassName: "font-semibold text-right",
      className: "text-right",
      cell: (admin) => (
        <div className="flex justify-end gap-2">
          {!(userRole === "SUPER_ADMIN" && admin.role === "OWNER") &&
            !(userRole === "SUPER_ADMIN" && admin.role === "SUPER_ADMIN" && admin.id !== session?.user?.id) && (
              <button
                onClick={() => handleEditAdmin(admin)}
                title="Edit Admin"
                className="p-2 text-outline hover:text-primary transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            )}
          {!(userRole === "SUPER_ADMIN" && (admin.role === "SUPER_ADMIN" || admin.role === "OWNER")) &&
            admin.role !== "OWNER" &&
            admin.id !== session?.user?.id && (
              <button
                onClick={() => confirmDeleteAdmin(admin)}
                title="Delete Admin"
                className="p-2 text-outline hover:text-error transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-outline-variant/10">
      <DataTable
        columns={columns}
        rows={visibleAdmins}
        getRowKey={(admin) => admin.id}
        emptyMessage="Belum ada data administrator."
        tableClassName="whitespace-nowrap min-w-full w-full"
      />
    </div>
  );
};
