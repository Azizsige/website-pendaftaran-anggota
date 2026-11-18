"use client";

import React, { useEffect } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { AddAdminDrawer } from "./AddAdminDrawer";
import { EditAdminDrawer } from "./EditAdminDrawer";
import { AdminTable } from "./AdminTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PersonSummary } from "@/components/admin/PersonSummary";
import { useAdminStore } from "@/store/useAdminStore";

export const AdminManagementTab = () => {
  const {
    loading,
    fetchAdmins,
    setIsAddAdminOpen,
    adminToDelete,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    executeDeleteAdmin,
    isDeleting,
  } = useAdminStore();

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  if (loading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8 dark:border-[#3c4d46] dark:bg-[#131d1a]">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-7 w-7 animate-spin text-[#006c49] dark:text-[#34d399]" aria-hidden />
          <p className="text-sm font-medium text-[#475569] dark:text-[#cbd6d0]">
            Memuat daftar administrator...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-6 sm:p-8 dark:border-[#3c4d46] dark:bg-[#131d1a]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#0f172a] sm:text-xl dark:text-[#eef2f4]">
            Manajemen Administrator
          </h2>
          <p className="mt-1 text-sm text-[#475569] dark:text-[#cbd6d0]">
            Kelola akun pengelola portal, penugasan peran, dan status akses sistem.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddAdminOpen(true)}
          className="flex min-h-[44px] w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#006c49] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005236] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 sm:w-auto dark:bg-[#057a55] dark:hover:bg-[#046c4e] dark:focus-visible:ring-[#34d399] dark:focus-visible:ring-offset-[#131d1a]"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          <span>Tambah Admin</span>
        </button>
      </div>

      <AdminTable />

      <AddAdminDrawer />
      <EditAdminDrawer />

      {adminToDelete && (
        <ConfirmDialog
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          tone="danger"
          icon="delete_forever"
          title="Hapus Data Admin?"
          description="Konfirmasi tindakan destruktif sistem"
          message="Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Akun administrator ini akan dicabut aksesnya dan dihapus dari sistem."
          confirmLabel="Ya, Hapus Permanen"
          requireText="HAPUS"
          acknowledgement="Saya memahami bahwa data admin ini akan dihapus secara permanen dan tidak dapat dipulihkan."
          isPending={isDeleting}
          onConfirm={() => executeDeleteAdmin(adminToDelete.id)}
        >
          <PersonSummary
            id={adminToDelete.id}
            name={adminToDelete.name}
            email={adminToDelete.email}
            status={adminToDelete.status || undefined}
          />
        </ConfirmDialog>
      )}
    </div>
  );
};
