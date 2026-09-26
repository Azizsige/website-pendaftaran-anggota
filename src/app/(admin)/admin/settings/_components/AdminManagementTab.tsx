"use client";

import React, { useEffect } from 'react';
import { AddAdminDrawer } from './AddAdminDrawer';
import { EditAdminDrawer } from './EditAdminDrawer';
import { AdminTable } from './AdminTable';
import ApplicantDeleteModal from '@/components/admin/modals/ApplicantDeleteModal';
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
          className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0 cursor-pointer w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>Add New Admin
        </button>
      </div>
      <hr className="border-outline-variant/20" />
      
      <AdminTable />

      <AddAdminDrawer />
      <EditAdminDrawer />
      
      {adminToDelete && (
        <ApplicantDeleteModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => executeDeleteAdmin(adminToDelete.id)}
          isPending={isDeleting}
          applicant={adminToDelete}
          titleMode="admin"
        />
      )}
    </div>
  );
};
