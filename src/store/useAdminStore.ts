import { create } from 'zustand';
import { getAdmins, deleteAdmin } from '@/actions/admin-management';
import { toast } from 'sonner';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AdminState {
  admins: Admin[];
  loading: boolean;
  isAddAdminOpen: boolean;
  isEditAdminOpen: boolean;
  selectedAdmin: Admin | null;
  isDeleteModalOpen: boolean;
  adminToDelete: Admin | null;
  isDeleting: boolean;

  setAdmins: (admins: Admin[]) => void;
  setLoading: (loading: boolean) => void;
  setIsAddAdminOpen: (isOpen: boolean) => void;
  setIsEditAdminOpen: (isOpen: boolean) => void;
  setSelectedAdmin: (admin: Admin | null) => void;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  setAdminToDelete: (admin: Admin | null) => void;
  setIsDeleting: (isDeleting: boolean) => void;

  fetchAdmins: () => Promise<void>;
  executeDeleteAdmin: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  admins: [],
  loading: true,
  isAddAdminOpen: false,
  isEditAdminOpen: false,
  selectedAdmin: null,
  isDeleteModalOpen: false,
  adminToDelete: null,
  isDeleting: false,

  setAdmins: (admins) => set({ admins }),
  setLoading: (loading) => set({ loading }),
  setIsAddAdminOpen: (isAddAdminOpen) => set({ isAddAdminOpen }),
  setIsEditAdminOpen: (isEditAdminOpen) => set({ isEditAdminOpen }),
  setSelectedAdmin: (selectedAdmin) => set({ selectedAdmin }),
  setIsDeleteModalOpen: (isDeleteModalOpen) => set({ isDeleteModalOpen }),
  setAdminToDelete: (adminToDelete) => set({ adminToDelete }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),

  fetchAdmins: async () => {
    set({ loading: true });
    try {
      const res = await getAdmins();
      if (res.data) {
        set({ admins: res.data as Admin[] });
      }
    } catch (error) {
      toast.error("Gagal mengambil data admin");
    } finally {
      set({ loading: false });
    }
  },

  executeDeleteAdmin: async (id: string) => {
    set({ isDeleting: true });
    try {
      const res = await deleteAdmin(id);
      if (res.success) {
        toast.success("Admin berhasil dihapus");
        set({ isDeleteModalOpen: false, adminToDelete: null });
        await get().fetchAdmins();
      } else {
        toast.error(res.error || "Gagal menghapus admin");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus admin");
    } finally {
      set({ isDeleting: false });
    }
  },
}));
