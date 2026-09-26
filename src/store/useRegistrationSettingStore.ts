import { create } from 'zustand';
import { DateRange } from "react-day-picker";
import { getSystemSettings, updateMultipleSettings } from '@/app/actions/setting-actions';
import { parseISO } from "date-fns";
import { toast } from 'sonner';

interface RegistrationSettingStore {
  isRegistrationActive: boolean;
  registrationDate: DateRange | undefined;
  maxQuota: string;
  reqKtm: boolean;
  reqFoto: boolean;
  isLoading: boolean;
  isSaving: boolean;
  
  setField: (field: string, value: any) => void;
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

  setField: (field, value) => set({ [field]: value }),

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await getSystemSettings();
      if (res.success && res.data) {
        let newFrom: Date | undefined = undefined;
        let newTo: Date | undefined = undefined;
        const updates: Partial<RegistrationSettingStore> = {};

        res.data.forEach((setting: any) => {
          if (setting.key === 'reg_is_active') updates.isRegistrationActive = setting.value === 'true';
          if (setting.key === 'reg_date_from' && setting.value) newFrom = parseISO(setting.value);
          if (setting.key === 'reg_date_to' && setting.value) newTo = parseISO(setting.value);
          if (setting.key === 'reg_max_quota') updates.maxQuota = setting.value;
          if (setting.key === 'reg_req_ktm') updates.reqKtm = setting.value === 'true';
          if (setting.key === 'reg_req_foto') updates.reqFoto = setting.value === 'true';
        });

        if (newFrom || newTo) {
          updates.registrationDate = { from: newFrom, to: newTo };
        } else {
          updates.registrationDate = undefined;
        }
        
        set(updates);
      }
    } catch (error) {
      console.error("Failed to fetch registration settings:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  handleSave: async () => {
    const { isRegistrationActive, registrationDate, maxQuota, reqKtm, reqFoto } = get();
    set({ isSaving: true });
    
    try {
      const settingsToUpdate = [
        { key: 'reg_is_active', value: isRegistrationActive.toString() },
        { key: 'reg_date_from', value: registrationDate?.from ? registrationDate.from.toISOString() : '' },
        { key: 'reg_date_to', value: registrationDate?.to ? registrationDate.to.toISOString() : '' },
        { key: 'reg_max_quota', value: maxQuota },
        { key: 'reg_req_ktm', value: reqKtm.toString() },
        { key: 'reg_req_foto', value: reqFoto.toString() },
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
