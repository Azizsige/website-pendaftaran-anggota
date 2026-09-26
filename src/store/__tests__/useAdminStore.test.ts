import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminStore } from '../useAdminStore';
import * as adminManagementActions from '@/actions/admin-management';

vi.mock('@/actions/admin-management', () => ({
  getAdmins: vi.fn(),
  deleteAdmin: vi.fn(),
}));

describe('useAdminStore (Zustand)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminStore.setState({
      admins: [],
      loading: false,
      isAddAdminOpen: false,
      isEditAdminOpen: false,
      selectedAdmin: null,
      isDeleteModalOpen: false,
      adminToDelete: null,
      isDeleting: false,
    });
  });

  it('1. state default sesuai', () => {
    const state = useAdminStore.getState();
    expect(state.admins).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('2. fetchAdmins mengubah loading true/false dan set admins jika success', async () => {
    const mockData = [{ id: '1', name: 'Budi', email: 'budi@test.com', role: 'STAFF', status: 'ACTIVE' }];
    vi.mocked(adminManagementActions.getAdmins).mockResolvedValueOnce({ data: mockData as any });
    
    // We cannot easily test the `loading` true state because it's synchronous before await,
    // but we can test the final state.
    await useAdminStore.getState().fetchAdmins();
    
    const state = useAdminStore.getState();
    expect(adminManagementActions.getAdmins).toHaveBeenCalled();
    expect(state.admins).toEqual(mockData);
    expect(state.loading).toBe(false);
  });

  it('3. executeDeleteAdmin memanggil actions dan merefresh list', async () => {
    vi.mocked(adminManagementActions.deleteAdmin).mockResolvedValueOnce({ success: true });
    vi.mocked(adminManagementActions.getAdmins).mockResolvedValueOnce({ data: [] });

    useAdminStore.setState({ isDeleteModalOpen: true, adminToDelete: { id: '1' } as any });
    
    await useAdminStore.getState().executeDeleteAdmin('1');
    
    const state = useAdminStore.getState();
    expect(adminManagementActions.deleteAdmin).toHaveBeenCalledWith('1');
    expect(adminManagementActions.getAdmins).toHaveBeenCalled(); // via fetchAdmins
    expect(state.isDeleteModalOpen).toBe(false);
    expect(state.adminToDelete).toBeNull();
    expect(state.isDeleting).toBe(false);
  });
});
