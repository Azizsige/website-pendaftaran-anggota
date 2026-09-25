"use client";

import React, { useState } from 'react';
import { AddAdminDrawer } from './AddAdminDrawer';
import { EditAdminDrawer } from './EditAdminDrawer';

const MOCK_ADMINS = [
  { id: '1', fullName: 'Budi Santoso', email: 'budi.santoso@example.com', role: 'Super Admin', status: 'Active', initials: 'BS', bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
  { id: '2', fullName: 'Siti Aminah', email: 'siti.aminah@example.com', role: 'Koordinator', status: 'Active', initials: 'SA', bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
  { id: '3', fullName: 'Andi Wijaya', email: 'andi.wijaya@example.com', role: 'Staff', status: 'Inactive', initials: 'AW', bg: 'bg-surface-variant/50', text: 'text-on-surface-variant' },
];

export const AdminManagementTab = () => {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<{ id: string, fullName: string, email: string, role: string } | null>(null);

  const handleEditAdmin = (admin: typeof MOCK_ADMINS[0]) => {
    const roleValue = admin.role === 'Super Admin' ? 'super_admin' : admin.role === 'Koordinator' ? 'koordinator' : 'staff';
    setSelectedAdmin({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      role: roleValue
    });
    setIsEditAdminOpen(true);
  };

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
      <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-outline-variant/10">
        <table className="text-left border-collapse text-sm whitespace-nowrap">
          <thead className="border-b border-outline-variant/20 bg-surface-container-lowest">
            <tr className="text-sm text-outline">
              <th className="py-3 px-4 font-semibold">Name</th>
              <th className="py-3 px-4 font-semibold">Email Address</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {MOCK_ADMINS.map((admin) => (
              <tr key={admin.id} className="hover:bg-surface-variant/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${admin.bg} flex items-center justify-center ${admin.text} font-bold text-xs shrink-0`}>{admin.initials}</div>
                    <span className="font-medium text-sm text-on-surface">{admin.fullName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-on-surface-variant break-all sm:break-normal">{admin.email}</td>
                <td className="py-4 px-4 text-sm text-on-surface-variant">{admin.role}</td>
                <td className="py-4 px-4">
                  {admin.status === 'Active' ? (
                    <span className="px-2.5 py-1 bg-primary/10 text-primary-container text-xs font-semibold rounded-full">Active</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-full">Inactive</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      title="Edit Admin"
                      className="p-2 text-outline hover:text-primary transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button title="Delete Admin" className="p-2 text-outline hover:text-error transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddAdminDrawer open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen} />
      <EditAdminDrawer open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen} adminData={selectedAdmin} />
    </div>
  );
};
