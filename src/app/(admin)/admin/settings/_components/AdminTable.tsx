import React from 'react';
import { useSession } from 'next-auth/react';
import { useAdminStore, Admin } from '@/store/useAdminStore';

export const AdminTable = () => {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const { admins, setSelectedAdmin, setIsEditAdminOpen, setAdminToDelete, setIsDeleteModalOpen } = useAdminStore();

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsEditAdminOpen(true);
  };

  const confirmDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-outline-variant/10">
      <table className="text-left border-collapse text-sm whitespace-nowrap min-w-full w-full">
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
          {admins.filter(admin => admin.role !== 'OWNER' || userRole === 'OWNER').map((admin) => (
            <tr key={admin.id} className="hover:bg-surface-variant/30 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0`}>
                    {admin.name ? admin.name.substring(0, 2).toUpperCase() : 'NA'}
                  </div>
                  <span className="font-medium text-sm text-on-surface">{admin.name}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-on-surface-variant break-all sm:break-normal">{admin.email}</td>
              <td className="py-4 px-4 text-sm text-on-surface-variant">{admin.role}</td>
              <td className="py-4 px-4">
                {admin.status === 'ACTIVE' ? (
                  <span className="px-2.5 py-1 bg-primary/10 text-primary-container text-xs font-semibold rounded-full">Active</span>
                ) : (
                  <span className="px-2.5 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded-full">Inactive</span>
                )}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex justify-end gap-2">
                  {!(userRole === 'SUPER_ADMIN' && admin.role === 'OWNER') && !(userRole === 'SUPER_ADMIN' && admin.role === 'SUPER_ADMIN' && admin.id !== (session?.user as any)?.id) && (
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      title="Edit Admin"
                      className="p-2 text-outline hover:text-primary transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                  {!(userRole === 'SUPER_ADMIN' && (admin.role === 'SUPER_ADMIN' || admin.role === 'OWNER')) && admin.role !== 'OWNER' && admin.id !== (session?.user as any)?.id && (
                    <button 
                      onClick={() => confirmDeleteAdmin(admin)}
                      title="Delete Admin" 
                      className="p-2 text-outline hover:text-error transition-colors rounded-lg hover:bg-surface-variant/50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
