import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRegistrationSettingStore } from '../useRegistrationSettingStore';

// Mock the setting actions
vi.mock('@/app/actions/setting-actions', () => ({
  getSystemSettings: vi.fn(),
  updateMultipleSettings: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { getSystemSettings, updateMultipleSettings } from '@/app/actions/setting-actions';
import { toast } from 'sonner';

describe('useRegistrationSettingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegistrationSettingStore.setState({
      isRegistrationActive: true,
      maxQuota: "1000",
      reqKtm: true,
      reqFoto: true,
      isLoading: true,
      isSaving: false,
    });
  });

  it('should initialize with default values', () => {
    const state = useRegistrationSettingStore.getState();
    expect(state.isRegistrationActive).toBe(true);
    expect(state.maxQuota).toBe("1000");
    expect(state.reqKtm).toBe(true);
    expect(state.reqFoto).toBe(true);
    expect(state.isLoading).toBe(true);
    expect(state.isSaving).toBe(false);
  });

  it('should update field using setField', () => {
    const { setField } = useRegistrationSettingStore.getState();
    setField('maxQuota', '500');
    expect(useRegistrationSettingStore.getState().maxQuota).toBe('500');

    setField('isRegistrationActive', false);
    expect(useRegistrationSettingStore.getState().isRegistrationActive).toBe(false);
  });

  it('should load settings from API', async () => {
    const mockData = [
      { key: 'reg_is_active', value: 'false' },
      { key: 'reg_max_quota', value: '250' },
      { key: 'reg_req_ktm', value: 'false' },
      { key: 'reg_req_foto', value: 'true' },
    ];
    
    (getSystemSettings as any).mockResolvedValue({ success: true, data: mockData });

    const { loadSettings } = useRegistrationSettingStore.getState();
    await loadSettings();

    const state = useRegistrationSettingStore.getState();
    expect(state.isRegistrationActive).toBe(false);
    expect(state.maxQuota).toBe('250');
    expect(state.reqKtm).toBe(false);
    expect(state.reqFoto).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should handle save settings', async () => {
    (updateMultipleSettings as any).mockResolvedValue({ success: true });

    const { handleSave, setField } = useRegistrationSettingStore.getState();
    setField('maxQuota', '750');
    
    await handleSave();

    expect(updateMultipleSettings).toHaveBeenCalled();
    const calls = (updateMultipleSettings as any).mock.calls[0][0];
    
    const maxQuotaUpdate = calls.find((c: any) => c.key === 'reg_max_quota');
    expect(maxQuotaUpdate.value).toBe('750');
    
    expect(toast.success).toHaveBeenCalledWith("Registration settings updated successfully!");
    expect(useRegistrationSettingStore.getState().isSaving).toBe(false);
  });
});
