import { create } from 'zustand';
import { DateRange } from "react-day-picker";
import { getSystemSettings, updateMultipleSettings } from '@/actions/setting-actions';
import { toast } from 'sonner';
import { SETTING_KEYS, parseRegistrationSettings } from '@/lib/constants/settings';
import { logger } from '@/lib/logger';

interface RegistrationSettingStore {
  isRegistrationActive: boolean;
  registrationDate: DateRange | undefined;
  maxQuota: string;
  reqKtm: boolean;
  reqFoto: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  setField: <K extends keyof RegistrationSettingStore>(field: K, value: RegistrationSettingStore[K]) => void;
  loadSettings: () => Promise<void>;
  handleSave: () => Promise<void>;
}

export const useRegistrationSettingStore = create<RegistrationSettingStore>((set, get) => ({
  isRegistrationActive: true,
  registrationDate: {
    from: new Date(2023, 9, 1),
    to: new Date(2023, 11, 31)
  },
  maxQuota: "1000",
  reqKtm: true,
  reqFoto: true,
  isLoading: true,
  isSaving: false,

  setField: (field, value) => set({ [field]: value } as unknown as Partial<RegistrationSettingStore>),

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await getSystemSettings();
      if (res.success && res.data) {
        const parsed = parseRegistrationSettings(res.data);
        
        set({
          isRegistrationActive: parsed.isActive,
          reqKtm: parsed.reqKtm,
          reqFoto: parsed.reqFoto,
          maxQuota: parsed.maxQuota.toString(),
          registrationDate: (parsed.dateFrom || parsed.dateTo)
            ? { from: parsed.dateFrom ?? undefined, to: parsed.dateTo ?? undefined }
            : undefined,
        });
      }
    } catch (error) {
      logger.error("Failed to fetch registration settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  handleSave: async () => {
    const { isRegistrationActive, registrationDate, maxQuota, reqKtm, reqFoto } = get();
    set({ isSaving: true });
    
    try {
      const settingsToUpdate = [
        { key: SETTING_KEYS.REG_IS_ACTIVE, value: isRegistrationActive.toString() },
        { key: SETTING_KEYS.REG_DATE_FROM, value: registrationDate?.from ? registrationDate.from.toISOString() : '' },
        { key: SETTING_KEYS.REG_DATE_TO, value: registrationDate?.to ? registrationDate.to.toISOString() : '' },
        { key: SETTING_KEYS.REG_MAX_QUOTA, value: maxQuota },
        { key: SETTING_KEYS.REG_REQ_KTM, value: reqKtm.toString() },
        { key: SETTING_KEYS.REG_REQ_FOTO, value: reqFoto.toString() },
      ];
      
      const res = await updateMultipleSettings(settingsToUpdate);
      if (res.success) {
        toast.success("Registration settings updated successfully!");
      } else {
        toast.error(res.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      set({ isSaving: false });
    }
  }
}));
