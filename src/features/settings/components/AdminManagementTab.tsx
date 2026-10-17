"use client";

import React, { useEffect } from 'react';
import { AddAdminDrawer } from './AddAdminDrawer';
import { EditAdminDrawer } from './EditAdminDrawer';
import { AdminTable } from './AdminTable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PersonSummary } from '@/components/admin/PersonSummary';
import { useAdminStore } from '@/store/useAdminStore';

export const AdminManagementTab = () => {
  const { 
    loading, fetchAdmins, setIsAddAdminOpen, 
    adminToDelete, isDeleteModalOpen, setIsDeleteModalOpen, 
    executeDeleteAdmin, isDeleting 
  } = useAdminStore();

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  if (loading) {
    return (
      <div className="bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex items-center justify-center min-h-[400px] shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
          <p className="text-sm text-on-surface-variant">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 bg-surface border border-outline-variant/20 rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-on-surface tracking-tight">Admin Management</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage administrator access, roles, and security settings.</p>
        </div>
        <button
          onClick={() => setIsAddAdminOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Add New Admin
        </button>
      </div>
      <hr className="border-outline-variant/20" />
      
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
          message="Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Akun administrator ini akan dihapus dari sistem."
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
